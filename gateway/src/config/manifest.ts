import {
  goodPlugin,
  graphiqlPlugin,
  graphqlPlugin,
  inertPlugin,
  swaggerPlugin,
  visionPlugin
} from './plugins'

export const getManifest = (port: string | undefined) => {
  let hapiPort
  if (port) {
    hapiPort = port
  } else {
    hapiPort = 8000
  }
  return {
    server: {
      port: hapiPort,
      app: {
        slogan: 'OpenCRVS GraphQL API Gateway'
      },
      debug: {
        request: ['error'] // TODO: with Process Env - if prod set to 'implementation'
      }
    },
    register: {
      // First list plugins available to Hapi
      plugins: [
        graphqlPlugin,
        graphiqlPlugin,
        goodPlugin,
        swaggerPlugin,
        inertPlugin,
        visionPlugin
        // List Public Routes
        /*{
          plugin: './routes/auth',
          options: {
            select: ['api'],
            routes: {
              prefix: '/auth'
            }
          }
        }*/
        // List Protected Routes
      ]
    }
  }
}
