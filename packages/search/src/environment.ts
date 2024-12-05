import { cleanEnv, str, port, url, num } from 'envalid'

export const env = cleanEnv(process.env, {
  HOST: str({ devDefault: '0.0.0.0' }),
  PORT: port({ devDefault: 9090 }),
  ES_HOST: str({ devDefault: 'localhost:9200' }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  MATCH_SCORE_THRESHOLD: num({ default: 1.0 }),
  OPENCRVS_INDEX_NAME: str({ devDefault: 'ocrvs' }),
  DEFAULT_TIMEOUT: num({ devDefault: 600000 }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  HEARTH_MONGO_URL: str({ devDefault: 'mongodb://localhost/hearth-dev' })
})
