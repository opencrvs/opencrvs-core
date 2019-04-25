import * as Good from 'good'
import * as Rate from 'hapi-rate-limitor'
import { MAX_RATE_LIMIT, MAX_RATE_LIMIT_DURATION } from 'src/constants'

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

  if (process.env.RATE_LIMIT !== 'false') {
    plugins.push({
      plugin: Rate,
      options: {
        userAttribute: 'id',
        max: MAX_RATE_LIMIT,
        duration: MAX_RATE_LIMIT_DURATION
      }
    })
  }

  return plugins
}
