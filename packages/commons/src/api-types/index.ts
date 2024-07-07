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
import { HapiRoutes as authRoutes } from './auth'
import { HapiRoutes as configRoutes } from './config'
import { HapiRoutes as documentsRoutes } from './documents'
import { HapiRoutes as metricsRoutes } from './metrics'
import { HapiRoutes as notificationRoutes } from './notification'
import { HapiRoutes as searchRoutes } from './search'
import { HapiRoutes as user_mgntRoutes } from './user-mgnt'
import { HapiRoutes as webhooksRoutes } from './webhooks'
import { HapiRoutes as workflowRoutes } from './workflow'

export type AllRoutes = {
  auth: authRoutes
  config: configRoutes
  documents: documentsRoutes
  metrics: metricsRoutes
  notification: notificationRoutes
  search: searchRoutes
  'user-mgnt': user_mgntRoutes
  webhooks: webhooksRoutes
  workflow: workflowRoutes
}
