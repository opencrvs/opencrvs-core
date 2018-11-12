export const getRoutes = () => {
  // add ping route by default for health check
  const routes = [
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        return 'pong'
      },
      config: {
        tags: ['api']
      }
    }
  ]
  return routes
}
