import { graphiqlHapi, graphqlHapi } from 'apollo-server-hapi'
import { executableSchema } from '../graphql/config'

export const graphqlPlugin = {
  plugin: graphqlHapi,
  options: {
    path: '/graphql',
    graphqlOptions: (request: any) => ({
      pretty: true,
      schema: executableSchema,
      // this is where you add anything you want attached to context in resolvers
      context: {}
    })
  }
}

export const graphiqlPlugin = {
  plugin: graphiqlHapi,
  options: {
    path: '/graphiql',
    graphiqlOptions: {
      endpointURL: '/graphql'
    }
  }
}

export const goodPlugin = {
  plugin: 'good',
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
  }
}

export const swaggerPlugin = {
  plugin: 'hapi-swagger',
  options: {
    info: {
      title: 'OpenCRVS Auth Gateway Documentation',
      version: '1.0.0'
    },
    documentationPath: '/docs',
    basePath: '/',
    pathPrefixSize: 2,
    jsonPath: '/docs/swagger.json',
    sortPaths: 'path-method',
    lang: 'en',
    tags: [
      {
        name: 'api'
      }
    ]
  }
}

export const visionPlugin = {
  plugin: 'vision'
}

export const inertPlugin = {
  plugin: 'inert'
}
