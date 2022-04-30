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
import { NOTIFICATION_TYPE } from '@opencrvs/components/lib/interface'

export const REDIRECT_DELAY = 2000

export enum ActionStatus {
  IDLE = 'IDLE',
  MODAL = 'MODAL',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type INotifiableStatus =
  | ActionStatus.ERROR
  | ActionStatus.COMPLETED
  | ActionStatus.PROCESSING

export const NOTIFIABLE_STATUSES = [
  ActionStatus.ERROR,
  ActionStatus.PROCESSING,
  ActionStatus.COMPLETED
]

export const NOTIFICATION_TYPE_MAP = {
  [ActionStatus.ERROR]: NOTIFICATION_TYPE.ERROR,
  [ActionStatus.PROCESSING]: NOTIFICATION_TYPE.IN_PROGRESS,
  [ActionStatus.COMPLETED]: NOTIFICATION_TYPE.SUCCESS
}

export function isNotifiable(
  status: ActionStatus
): status is INotifiableStatus {
  return NOTIFIABLE_STATUSES.includes(status)
}

export function isDefaultDraft({ version }: { version: number }) {
  return version === 0
}
