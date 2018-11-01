importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
)

const queue = new workbox.backgroundSync.Queue('registerQueue')
const GraphQLMatch = /graphql(\S+)?/

self.addEventListener('fetch', event => {
  if (null !== event.request.url.match(GraphQLMatch)) {
    const promiseChain = fetch(event.request.clone()).catch(err => {
      return queue.addRequest(event.request)
    })

    event.waitUntil(promiseChain)
  }
})
workbox.precaching.precacheAndRoute([])
