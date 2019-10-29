import * as Pino from 'hapi-pino'
import * as JWT from 'hapi-auth-jwt2'

export default function getPlugins() {
  const plugins: any[] = [
    JWT,
    {
      plugin: Pino,
      options: {
        prettyPrint: process.env.NODE_ENV !== 'production'
      }
    }
  ]

  return plugins
}
