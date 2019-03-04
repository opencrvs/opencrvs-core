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
      path: '/events/new-registration',
      handler: (request: any, h: any) => {
        // TODO: generate metrics from this event
        return {}
      },
      config: {
        tags: ['api'],
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/events/registration',
      handler: (request: any, h: any) => {
        // TODO: generate metrics from this event
        return {}
      },
      config: {
        tags: ['api'],
        auth: false
      }
    },

    // Metrics query API
    {
      method: 'GET',
      path: '/metrics/birth',
      handler: (request: any, h: any) => {
        // TODO: generate all birth metrics, use a timePeriod search param to control whether the points in the series are month or years
        return {
          keyFigures: {},
          regByAge: {},
          regWithin$5d: {}
        }
      },
      config: {
        tags: ['api']
      }
    }
  ]
  return routes
}
