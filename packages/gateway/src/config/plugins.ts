import { graphiqlHapi } from 'apollo-server-hapi'
import * as Good from 'good'
import * as HapiSwagger from 'hapi-swagger'
import * as Inert from 'inert'
import * as Vision from 'vision'
// import { executableSchema} from '../graphql/config'

export const getPlugins = (env: string | undefined) => {
  const plugins: any[] = []

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
  /* plugins.push({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: (request: any) => ({
        pretty: true,
        schema: executableSchema,
        // this is where you add anything you want attached to context in resolvers
        context: {}
      })
    }
  })
  plugins.push({
    register: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql'
      }
    }
  })*/
  return plugins
}
