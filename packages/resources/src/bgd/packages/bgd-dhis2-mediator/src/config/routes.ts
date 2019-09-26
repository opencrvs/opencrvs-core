import { birthNotificationHandler } from '@search/features/notification/birth/handler'
import { deathNotificationHandler } from '@search/features/notification/death/handler'

const enum RouteScope {
  DECLARE = 'declare',
  VALIDATE = 'validate',
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
      path: '/notification/birth',
      handler: birthNotificationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE] // TODO is this the correct scope for notification
        },
        description:
          'Handles transformation and submission of birth notification'
      }
    },
    {
      method: 'POST',
      path: '/notification/death',
      handler: deathNotificationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE] // TODO is this the correct scope for notification
        },
        description:
          'Handles transformation and submission of death notification'
      }
    }
  ]
  return routes
}
