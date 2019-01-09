import { fhirWorkflowEventHandler } from 'src/features/events/handler'

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
          'Mimics the fhir API, detects OpenCRVS event and calls the correct workflow handler. Else, just forwards the request to Hearth.',
        plugins: {
          'hapi-swagger': {
            responses: {
              200: {
                description: 'Successful, see standard fhir response types'
              },
              400: {
                description:
                  'Bad request, see standard fhir error response types'
              }
            }
          }
        }
      }
    }
  ]
  return routes
}
