const proxy = require('http-proxy-middleware')
module.exports = function(app) {
  app.use(
    '/gateway',
    proxy({
      target: 'http://localhost:7070',
      changeOrigin: true,
      pathRewrite: {
        '^/gateway': '/'
      }
    })
  )
  app.use(
    '/resources',
    proxy({
      target: 'http://localhost:3040/bgd',
      changeOrigin: true,
      pathRewrite: {
        '^/resources': '/'
      }
    })
  )
}
