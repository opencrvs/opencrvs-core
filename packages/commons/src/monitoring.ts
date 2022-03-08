import pkgUp = require('pkg-up')

async function init() {
  if (process.env.NODE_ENV === 'production') {
    const path = await pkgUp()

    require('elastic-apm-node').start({
      // Override service name from package.json
      // Allowed characters: a-z, A-Z, 0-9, -, _, and space
      serviceName: require(path!).name.replace('@', '').replace('/', '_'),
      // Set custom APM Server URL (default: http://localhost:8200)
      serverUrl: process.env.APN_SERVICE_URL || 'http://localhost:8200'
    })
  }
}
init()
