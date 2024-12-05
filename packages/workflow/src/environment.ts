import { cleanEnv, str, url, num } from 'envalid'

export const env = cleanEnv(process.env, {
  HOST: str({ devDefault: '0.0.0.0' }),
  PORT: num({ devDefault: 5050 }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  NOTIFICATION_SERVICE_URL: url({ devDefault: 'http://localhost:2020/' }),
  SEARCH_URL: url({ devDefault: 'http://localhost:9090/' }),
  WEBHOOKS_URL: url({ devDefault: 'http://localhost:2525/' }),
  METRICS_URL: url({ devDefault: 'http://localhost:1050/' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  DOCUMENTS_URL: url({ devDefault: 'http://localhost:9050' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  SENTRY_DSN: str({ default: undefined }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040/' }),
  DEFAULT_TIMEOUT: num({ devDefault: 600000 }),
  LANGUAGES: str({ devDefault: 'en,fr' })
})
