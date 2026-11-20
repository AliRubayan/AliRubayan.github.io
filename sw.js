/* Absar demo service worker. It only shows the alert notifications and
   brings the app forward when one is tapped. There is no fetch handler, so
   nothing is cached and every visit loads the latest build. */

self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => "focus" in w)
      if (open) return open.focus()
      return self.clients.openWindow("./worker.html")
    })
  )
})
