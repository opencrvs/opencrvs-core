import { graphqlHapi } from 'apollo-server-hapi'
import * as Good from 'good'
import * as JWT from 'hapi-auth-jwt2'
import { getExecutableSchema } from '@gateway/graphql/config'

export const getPlugins = (env: string | undefined, schemaPath: string) => {
  const plugins: any[] = []
  const executableSchema = getExecutableSchema(schemaPath)

  plugins.push(
    JWT,
    {
      plugin: Good,
      options: {
        ops: {
          interval: 1000
        },
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [
                {
                  log: '*',
                  response: '*'
                }
              ]
            },
            {
              module: 'good-console'
            },
            'stdout'
          ]
        }
      },
      name: 'good',
      version: '8.1.1'
    },
    {
      plugin: graphqlHapi,
      options: {
        path: '/graphql',
        graphqlOptions: (request: any) => ({
          pretty: true,
          schema: executableSchema,
          // this is where you add anything you want attached to context in resolvers
          context: {
            Authorization: request.headers['authorization']
          }
        })
      },
      name: 'graphqlHapi',
      version: '1.3.6'
    }
  )

  return plugins
}
