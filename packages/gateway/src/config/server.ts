import * as Bunyan from 'bunyan'
import * as Hapi from 'hapi'

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

  return server
}
