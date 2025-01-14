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

import { cleanEnv, url } from 'envalid'

/**
 * When defining variables aim to be consistent with existing values.
 * Define URLs without trailing slashes.
 */
export const env = cleanEnv(process.env, {
  EVENTS_MONGO_URL: url({ devDefault: 'mongodb://localhost/events' }),
  USER_MGNT_MONGO_URL: url({ devDefault: 'mongodb://localhost/user-mgnt' }),
  ES_HOST: url({ devDefault: 'http://localhost:9200' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  DOCUMENTS_URL: url({ devDefault: 'http://localhost:9050' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030' })
})
