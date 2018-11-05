importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
)

const queue = new workbox.backgroundSync.Queue('registerQueue', {
  callbacks: {
    queueDidReplay: function(a) {
      var requestSynced = 0
      a.forEach(item => {
        if (!item.error) {
          requestSynced++
        }
      })

      if (requestSynced) {
        new BroadcastChannel('backgroundSynBroadCastChannel').postMessage(
          requestSynced
        )
      }
    }
  }
})
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

/*
*   Alternate for navigateFallback & navigateFallbackBlacklist
*/
workbox.routing.registerNavigationRoute('/index.html', {
  blacklist: [/^\/__.*$/]
})
