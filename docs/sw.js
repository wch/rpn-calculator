var a="0.1.0";var l=`rpn-calculator-v${a}`,n=`rpn-calculator-static-v${a}`,c=`rpn-calculator-dynamic-v${a}`,d=["./","./index.html","./main.js","./main.css","./manifest.json","./icons/icon.svg","./icons/screenshot-wide.svg","./browserconfig.xml"];self.addEventListener("install",t=>{console.log("[SW] Install event"),t.waitUntil(caches.open(n).then(e=>(console.log("[SW] Caching static assets"),e.addAll(d))).then(()=>(console.log("[SW] Static assets cached successfully"),self.skipWaiting())).catch(e=>{console.error("[SW] Failed to cache static assets:",e)}))});self.addEventListener("activate",t=>{console.log("[SW] Activate event"),t.waitUntil(caches.keys().then(e=>Promise.all(e.map(s=>{if(s!==n&&s!==c)return console.log("[SW] Deleting old cache:",s),caches.delete(s)}))).then(()=>(console.log("[SW] Old caches cleaned up"),self.clients.claim())))});self.addEventListener("fetch",t=>{t.request.url.startsWith("http")&&t.request.url.startsWith(self.location.origin)&&t.respondWith(caches.match(t.request).then(e=>e?(console.log("[SW] Serving from cache:",t.request.url),e):(console.log("[SW] Fetching from network:",t.request.url),fetch(t.request).then(s=>{if(!s||s.status!==200||s.type!=="basic")return s;let i=s.clone();return caches.open(c).then(o=>{o.put(t.request,i)}),s}).catch(s=>{if(console.error("[SW] Fetch failed:",s),t.request.mode==="navigate")return caches.match("/index.html").then(i=>i||new Response(`<!DOCTYPE html>
                    <html>
                    <head>
                      <title>RPN Calculator - Offline</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; }
                        .offline { color: #666; }
                      </style>
                    </head>
                    <body>
                      <h1>\u{1F9EE} RPN Calculator</h1>
                      <div class="offline">
                        <h2>You're offline</h2>
                        <p>The calculator will work once you're back online.</p>
                        <button onclick="window.location.reload()">Try Again</button>
                      </div>
                    </body>
                    </html>`,{status:200,statusText:"OK",headers:{"Content-Type":"text/html"}}));throw s}))))});self.addEventListener("message",t=>{console.log("[SW] Message received:",t.data);let e=t.data;e&&e.type==="SKIP_WAITING"&&self.skipWaiting(),e&&e.type==="GET_VERSION"&&t.ports[0].postMessage({version:l})});self.addEventListener("sync",t=>{console.log("[SW] Background sync:",t.tag),t.tag==="background-sync"&&t.waitUntil(Promise.resolve())});self.addEventListener("push",t=>{console.log("[SW] Push notification received");let e={body:t.data?t.data.text():"New update available",icon:"./icons/icon.svg",badge:"./icons/icon.svg",tag:"rpn-calculator",requireInteraction:!1};t.waitUntil(self.registration.showNotification("RPN Calculator",e))});console.log("[SW] Service Worker script loaded");
