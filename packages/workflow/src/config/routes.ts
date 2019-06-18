import { fhirWorkflowEventHandler } from '@workflow/features/events/handler'

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
      method: '*',
      path: '/fhir/{path*}',
      handler: fhirWorkflowEventHandler,
      config: {
        tags: ['api'],
        description:
          'Mimics the fhir API, detects OpenCRVS event and calls the correct workflow handler. Else, just forwards the request to Hearth.'
      }
    }
  ]
  return routes
}
