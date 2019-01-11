import { newDeclarationHandler } from 'src/features/newDeclaration/handler'

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
      path: 'events/birth/new-declaration',
      handler: newDeclarationHandler,
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
