import { cleanEnv, str, port, url, num } from 'envalid'

export const env = cleanEnv(process.env, {
  HOST: str({ default: '0.0.0.0' }),
  PORT: port({ default: 9090 }),
  ES_HOST: str({ devDefault: 'localhost:9200' }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  CERT_PUBLIC_KEY_PATH: str({ default: '../../.secrets/public-key.pem' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  MATCH_SCORE_THRESHOLD: num({ default: 1.0 }),
  OPENCRVS_INDEX_NAME: str({ default: 'ocrvs' }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  HEARTH_MONGO_URL: str({ default: 'mongodb://localhost/hearth-dev' })
})