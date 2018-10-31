importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
)

const queue = new workbox.backgroundSync.Queue('ocrvs-register')

self.addEventListener('fetch', event => {
  const promiseChain = fetch(event.request.clone()).catch(err => {
    return queue.addRequest(event.request)
  })

  event.waitUntil(promiseChain)
})
workbox.precaching.precacheAndRoute([])
