import createBirthRegistrationHandler from '../features/registration/handler'

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
              200: { description: 'Birth declration is successfully synced' },
              400: { description: 'Bad request, check your request body' }
            }
          }
        }
      }
    }
  ]
  return routes
}
