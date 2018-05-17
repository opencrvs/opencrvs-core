import * as glob from 'glob'
import * as path from 'path'

export const getRoutes = () => {
  // add ping route by default for health check
  const routes = [
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, reply: any) => {
        return reply('pong')
      },
      config: {
        tags: ['api']
      }
    }
  ]
  // add all routes from all modules to the routes array manually or write your routes inside a folder inside the server folder
  // with suffix as -routes.ts
  glob.sync('./routes/**/*-route.ts').forEach(file => {
    routes.push(require(path.resolve(file)))
  })
  return routes
}
