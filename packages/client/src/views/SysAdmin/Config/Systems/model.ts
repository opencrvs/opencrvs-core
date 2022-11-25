/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { SystemStatus, SystemType } from '@client/utils/gateway'

export enum WebhookOption {
  birth = 'BIRTH',
  death = 'DEATH'
}

export interface WebHookSetting {
  event: string
  permissions: string[]
}

export interface ISystem {
  clientId: string
  name: string
  shaSecret: string
  status: SystemStatus
  type: SystemType
  webhook?: WebHookSetting[]
}
