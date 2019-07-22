import * as Hapi from 'hapi'
import { HOST, PORT } from '@gateway/constants'

export const getServer = (): Hapi.Server => {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800 }
    }
  })

  return server
}
