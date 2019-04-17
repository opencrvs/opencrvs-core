import * as Joi from 'joi'
import {
  birthRegistrationHandler,
  newBirthRegistrationHandler
} from 'src/features/registration/handler'
import { metricsHandler } from 'src/features/registration/metrics/handler'

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

    // Event receiver routes
    {
      method: 'POST',
      path: '/events/birth/new-registration',
      handler: newBirthRegistrationHandler,
      config: {
        tags: ['api'],
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/events/birth/registration',
      handler: birthRegistrationHandler,
      config: {
        tags: ['api'],
        auth: false
      }
    },

    // Metrics query API
    {
      method: 'GET',
      path: '/metrics/birth',
      handler: metricsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required()
          })
        },
        tags: ['api']
      }
    }
  ]
  return routes
}
