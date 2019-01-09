import * as Good from 'good'
import * as HapiSwagger from 'hapi-swagger'
import * as Inert from 'inert'
import * as Vision from 'vision'
import * as JWT from 'hapi-auth-jwt2'

export default function getPlugins() {
  const plugins: any[] = [
    JWT,
    {
      plugin: Good,
      options: {
        ops: {
          interval: 1000
        },
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [
                {
                  log: '*',
                  response: '*'
                }
              ]
            },
            {
              module: 'good-console'
            },
            'stdout'
          ]
        }
      }
    }
  ]

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    plugins.push(Inert, Vision, {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'OpenCRVS Worflow Service Documentation',
          version: '1.0.0'
        }
      },
      name: 'hapi-swagger',
      version: '9.1.1'
    })
  }

  return plugins
}
