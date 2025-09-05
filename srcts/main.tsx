import { App } from "@/components/App";
import { createRoot } from "react-dom/client";
import "./globals.css";

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "./",
      });

      console.log(
        "[SW] Service Worker registered successfully:",
        registration.scope
      );

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log("[SW] New service worker installing");
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log("[SW] New content available, please refresh");

                // Optionally show a notification to the user
                if (Notification.permission === "granted") {
                  new Notification("App Update Available", {
                    body: "A new version of RPN Calculator is available. Refresh to update.",
                    icon: "./icons/icon.svg",
                  });
                }
              } else {
                // Content cached for first time
                console.log("[SW] Content cached for offline use");
              }
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("[SW] Message from service worker:", event.data);
      });
    } catch (error) {
      console.error("[SW] Service Worker registration failed:", error);
    }
  });

  // Handle service worker controller changes
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("[SW] Controller changed, reloading page");
    window.location.reload();
  });
}

// React App Initialization
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Could not find root element to mount React component.");
}
