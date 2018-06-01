import { graphiqlHapi, graphqlHapi } from 'apollo-server-hapi'
import * as Good from 'good'
import * as HapiSwagger from 'hapi-swagger'
import * as Inert from 'inert'
import * as Vision from 'vision'
import { getExecutableSchema } from 'src/graphql/config'

export const getPlugins = (env: string | undefined, schemaPath: string) => {
  const plugins: any[] = []
  const executableSchema = getExecutableSchema(schemaPath)

  if (env === 'DEVELOPMENT') {
    plugins.push(
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: {
          info: {
            title: 'OpenCRVS Auth Gateway Documentation',
            version: '1.0.0'
          }
        },
        name: 'hapi-swagger',
        version: '9.1.1'
      },
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
        plugin: graphiqlHapi,
        options: {
          path: '/graphiql',
          graphiqlOptions: {
            endpointURL: '/graphql'
          }
        },
        name: 'graphiql',
        version: '1.3.6'
      }
    )
  }

  plugins.push({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: (request: any) => ({
        pretty: true,
        schema: executableSchema,
        // this is where you add anything you want attached to context in resolvers
        context: {}
      })
    },
    name: 'graphqlHapi',
    version: '1.3.6'
  })

  return plugins
}
