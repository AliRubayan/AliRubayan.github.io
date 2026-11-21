/* Wasl demo service worker: serve the cached copy at once, refresh it in the background. */
const CACHE = "wasl-v16"
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"]
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))) })
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
))
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return
  const url = new URL(e.request.url)
  const own = url.origin === location.origin
  const font = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"
  if (!own && !font) return
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const key = own && e.request.mode === "navigate" ? "./index.html" : e.request
    const hit = await c.match(key, { ignoreSearch: own })
    const fresh = fetch(e.request).then((r) => { if (r.ok || r.type === "opaque") c.put(key, r.clone()); return r }).catch(() => null)
    if (hit) { e.waitUntil(fresh); return hit }
    return (await fresh) || Response.error()
  }))
})
