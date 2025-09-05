import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  promptInstall: () => Promise<boolean>;
  dismissPrompt: () => void;
}

export function useInstallPrompt(): InstallPromptState {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);

  // Check if app is running in standalone mode
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      document.referrer.includes("android-app://"));

  // Check if app is already installed
  useEffect(() => {
    setIsInstalled(isStandalone);
  }, [isStandalone]);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      console.log("[PWA] Install prompt available");
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App was installed");
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Function to trigger the install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      console.log("[PWA] No install prompt available");
      return false;
    }

    try {
      // Show the install prompt
      await installPrompt.prompt();

      // Wait for the user's response
      const choiceResult = await installPrompt.userChoice;
      console.log("[PWA] User choice:", choiceResult);

      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
        setInstallPrompt(null);
        return true;
      } else {
        console.log("[PWA] User dismissed the install prompt");
        setUserDismissed(true);
        return false;
      }
    } catch (error) {
      console.error("[PWA] Error showing install prompt:", error);
      return false;
    }
  }, [installPrompt]);

  // Function to dismiss the prompt (hide the install UI)
  const dismissPrompt = useCallback(() => {
    setUserDismissed(true);
    setInstallPrompt(null);
  }, []);

  return {
    isInstallable: !!installPrompt && !userDismissed,
    isInstalled,
    isStandalone,
    canInstall: !!installPrompt && !isInstalled && !userDismissed,
    promptInstall,
    dismissPrompt,
  };
}
