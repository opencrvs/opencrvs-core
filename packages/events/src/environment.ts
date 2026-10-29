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

import { cleanEnv, str, url, bool, num, port } from 'envalid'

/**
 * When defining variables aim to be consistent with existing values.
 * Define URLs without trailing slashes, include the protocol.
 */
export const env = cleanEnv(process.env, {
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  EVENTS_PORT: port({
    default: 5555,
    desc: 'Port the events service listens on. Derived per local development environment (slot) so several stacks can run side by side; defaults to the historical fixed port.'
  }),
  EVENTS_POSTGRES_URL: url({
    devDefault: 'postgres://events_app:app_password@localhost:5432/events'
  }),
  ES_URL: url({ devDefault: 'http://localhost:9200' }),
  ES_INDEX_PREFIX: str({ default: 'events' }),
  ES_REINDEXING_STATUS_INDEX: str({ default: 'reindexing_status' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  DOCUMENTS_URL: url({ devDefault: 'http://localhost:9050' }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040' }),
  TWO_FA_ENABLED: bool({
    devDefault: false,
    default: true,
    desc: 'Enable two-factor authentication. When disabled, verification codes are set to 000000.'
  }),
  DEFAULT_USER_PASSWORD: str({ devDefault: 'test', default: undefined }),
  EVENT_CONFIG_CACHE_TTL_MS: num({
    default: 60_000,
    desc: 'How long (ms) the events service caches event/workqueue configuration fetched from countryconfig before refetching. Bounds how stale served config can be after a countryconfig deploy that does not restart the events service.'
  })
})
