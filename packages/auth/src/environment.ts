/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { cleanEnv, str, port, url, num, bool } from 'envalid'

export const env = cleanEnv(process.env, {
  REDIS_HOST: str({ devDefault: 'localhost' }),
  AUTH_HOST: str({ default: '0.0.0.0' }),
  AUTH_PORT: port({ default: 4040 }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  METRICS_URL: url({ devDefault: 'http://localhost:1050' }),
  NOTIFICATION_SERVICE_URL: url({ devDefault: 'http://localhost:2020/' }),
  DOMAIN: str({ devDefault: '*' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040/' }), // used for external requests (CORS whitelist)
  COUNTRY_CONFIG_URL_INTERNAL: url({ devDefault: 'http://localhost:3040/' }), // used for internal service-to-service communication
  LOGIN_URL: url({ devDefault: 'http://localhost:3020/' }),
  CLIENT_APP_URL: url({ devDefault: 'http://localhost:3000/' }),
  CERT_PRIVATE_KEY_PATH: str({ devDefault: '../../.secrets/private-key.pem' }),
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  SENTRY_DSN: str({ default: undefined }),
  QA_ENV: bool({ default: false }),

  CONFIG_TOKEN_EXPIRY_SECONDS: num({ default: 604800 }), // 1 week
  CONFIG_SMS_CODE_EXPIRY_SECONDS: num({ default: 600 }), // 10 minutes
  CONFIG_SYSTEM_TOKEN_EXPIRY_SECONDS: num({ default: 600 }) // 10 minutes
})
