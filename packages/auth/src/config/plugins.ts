import * as Good from 'good'
import * as Inert from 'inert'
import * as Vision from 'vision'

export default function getPlugins() {
  const plugins: any[] = [
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
                  response: '*',
                  request: '*',
                  error: '*'
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
    plugins.push(Inert, Vision)
  }

  return plugins
}
