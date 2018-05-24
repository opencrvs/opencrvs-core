import * as Bunyan from 'bunyan'
import * as Hapi from 'hapi'
import { getRoutes } from './routes'

export const getServer = (
  env: string | undefined,
  myPort: string | undefined,
  logger: Bunyan
): Hapi.Server => {
  const port = myPort ? myPort : '7070'
  const server = new Hapi.Server({
    port,
    routes: {
      cors: { origin: ['*'] }
    }
  })
  const routes = getRoutes()
  server.route(routes)

  // setup default error handling
  const preResponse = (request: any, h: any) => {
    const response = request.response
    if (response.isBoom) {
      logger.error(response.stack)
    }
    return response
  }
  server.ext('onPreResponse', preResponse)

  return server
}
