import * as Good from 'good'
import * as RateLimit from 'hapi-rate-limitor'
import {
  MAX_RATE_LIMIT,
  MAX_RATE_LIMIT_DURATION,
  REDIS_HOST
} from 'src/constants'

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
      plugin: RateLimit,
      options: {
        redis: {
          port: 6379,
          host: REDIS_HOST
        },
        userAttribute: 'id',
        max: MAX_RATE_LIMIT,
        duration: MAX_RATE_LIMIT_DURATION
      }
    })
  }

  return plugins
}
