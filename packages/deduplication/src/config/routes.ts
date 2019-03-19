import {
  newBirthDeclarationHandler,
  updatedBirthDeclarationHandler
} from 'src/features/registration/birth/handler'
import { newDeathDeclarationHandler } from 'src/features/registration/death/handler'

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
      path: '/events/birth/new-declaration',
      handler: newBirthDeclarationHandler,
      config: {
        tags: ['api'],
        auth: false,
        description:
          'Handles indexing a new declaration and searching for duplicates'
      }
    },
    {
      method: 'POST',
      path: '/events/birth/update-declaration',
      handler: updatedBirthDeclarationHandler,
      config: {
        tags: ['api'],
        auth: false,
        description:
          'Handles indexing an updated declaration and searching for duplicates',
        plugins: {
          'hapi-swagger': {
            responses: {
              200: {
                description: 'Successful'
              },
              400: {
                description: 'Bad request'
              }
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/events/death/new-declaration',
      handler: newDeathDeclarationHandler,
      config: {
        tags: ['api'],
        auth: false,
        description:
          'Handles indexing a new declaration and searching for duplicates'
      }
    }
  ]
  return routes
}
