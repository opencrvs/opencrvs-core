import * as Hapi from 'hapi'

export default function getRoutes() {
  // add ping route by default for health check
  const routes = [
    {
      method: 'GET',
      path: '/check-token',
      handler: (request: Hapi.Request) => request.auth.credentials
    }
  ]
  return routes
}
