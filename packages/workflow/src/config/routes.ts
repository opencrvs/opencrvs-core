import createBirthRegistrationHandler from '../features/registration/handler'
import updateTaskHandler from '../features/task/handler'

const enum RouteScope {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify'
}

export const getRoutes = () => {
  const routes = [
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        return 'pong'
      },
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/createBirthRegistration',
      handler: createBirthRegistrationHandler,
      config: {
        tags: ['api'],
        description:
          'Push trackingid before submitting to FHIR and send notification to the shared contact',
        auth: {
          scope: [RouteScope.DECLARE, RouteScope.REGISTER, RouteScope.CERTIFY]
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              200: { description: 'Birth declaration is successfully synced' },
              400: { description: 'Bad request, check your request body' }
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/updateTask',
      handler: updateTaskHandler,
      config: {
        tags: ['api'],
        description: 'Update Task with the user information and send to fhir',
        auth: {
          scope: [RouteScope.DECLARE, RouteScope.REGISTER, RouteScope.CERTIFY]
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              200: { description: 'Task is successfully synced' },
              400: { description: 'Bad request, check your request body' }
            }
          }
        }
      }
    }
  ]
  return routes
}
