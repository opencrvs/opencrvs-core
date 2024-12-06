import { cleanEnv, str, url, num } from 'envalid'

export const env = cleanEnv(process.env, {
  HOST: str({ default: '0.0.0.0' }),
  PORT: num({ default: 5050 }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  NOTIFICATION_SERVICE_URL: url({ devDefault: 'http://localhost:2020/' }),
  SEARCH_URL: url({ devDefault: 'http://localhost:9090/' }),
  WEBHOOKS_URL: url({ devDefault: 'http://localhost:2525/' }),
  METRICS_URL: url({ devDefault: 'http://localhost:1050/' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  CERT_PUBLIC_KEY_PATH: str({ default: '../../.secrets/public-key.pem' }),
  DOCUMENTS_URL: url({ devDefault: 'http://localhost:9050' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  SENTRY_DSN: str({ default: undefined }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040/' }),
  LANGUAGES: str({ default: 'en,fr' })
})
