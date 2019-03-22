import {
  newDeclarationHandler,
  updatedDeclarationHandler
} from 'src/features/newDeclaration/handler'
import { searchDeclaration } from 'src/features/search/handler'

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
      path: '/events/birth/new-declaration',
      handler: newDeclarationHandler,
      config: {
        tags: ['api'],
        auth: false,
        description:
          'Handles indexing a new declaration and searching for duplicates'
      }
    },
    {
      method: 'POST',
      path: '/search',
      handler: searchDeclaration,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.REGISTER]
        },
        description:
          'Handles indexing a new declaration and searching for duplicates'
      }
    },
    {
      method: 'POST',
      path: '/events/birth/update-declaration',
      handler: updatedDeclarationHandler,
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
    }
  ]
  return routes
}
