import * as Good from 'good'
import * as HapiSwagger from 'hapi-swagger'
import * as Inert from 'inert'
import * as Vision from 'vision'
import * as JWT from 'hapi-auth-jwt2'
import * as HapiI18n from 'hapi-i18n'
import { DEFAULT_LOCALE } from '../constants'

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
    },
    {
      plugin: HapiI18n,
      options: {
        locales: ['bn', 'en'],
        directory: __dirname + '/../i18n/locales',
        defaultLocale: DEFAULT_LOCALE,
        languageHeaderField: 'locale'
      }
    }
  ]

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    plugins.push(Inert, Vision, {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'OpenCRVS Notification Service Documentation',
          version: '1.0.0'
        }
      },
      name: 'hapi-swagger',
      version: '9.1.1'
    })
  }

  return plugins
}
