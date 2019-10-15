import { birthNotificationHandler } from '@bgd-dhis2-mediator/features/notification/birth/handler'
import { deathNotificationHandler } from '@bgd-dhis2-mediator/features/notification/death/handler'

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
      path: '/dhis2-notification/birth',
      handler: birthNotificationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE] // TODO we need to add a scope for notification and allow API user to be created with this scope
        },
        description:
          'Handles transformation and submission of birth notification'
      }
    },
    {
      method: 'POST',
      path: '/dhis2-notification/death',
      handler: deathNotificationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE] // TODO we need to add a scope for notification and allow API user to be created with this scope
        },
        description:
          'Handles transformation and submission of death notification'
      }
    }
  ]
  return routes
}
