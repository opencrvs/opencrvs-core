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

export const WEB_USER_JWT_AUDIENCES = [
  'opencrvs:auth-user',
  'opencrvs:user-mgnt-user',
  'opencrvs:hearth-user',
  'opencrvs:gateway-user',
  'opencrvs:notification-user',
  'opencrvs:workflow-user',
  'opencrvs:search-user',
  'opencrvs:metrics-user',
  'opencrvs:countryconfig-user',
  'opencrvs:webhooks-user',
  'opencrvs:config-user',
  'opencrvs:documents-user'
]
export const NOTIFICATION_API_USER_AUDIENCE = 'opencrvs:notification-api-user'
export const JWT_ISSUER = 'opencrvs:auth-service'
export const INVALID_TOKEN_NAMESPACE = 'invalidToken'
export const DEFAULT_TIMEOUT = 600000
