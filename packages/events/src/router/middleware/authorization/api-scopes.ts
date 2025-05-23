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
import { ActionType, ConfigurableScopeType } from '@opencrvs/commons'

// TODO CIHAN: move?
export const ACTION_ALLOWED_CONFIGURABLE_SCOPES = {
  [ActionType.READ]: [],
  [ActionType.CREATE]: ['notify.event'],
  [ActionType.NOTIFY]: ['notify.event'],
  [ActionType.DECLARE]: [],
  [ActionType.DELETE]: [],
  [ActionType.VALIDATE]: [],
  [ActionType.REGISTER]: [],
  [ActionType.PRINT_CERTIFICATE]: [],
  [ActionType.REQUEST_CORRECTION]: [],
  [ActionType.REJECT_CORRECTION]: [],
  [ActionType.APPROVE_CORRECTION]: [],
  [ActionType.MARKED_AS_DUPLICATE]: [],
  [ActionType.ARCHIVE]: [],
  [ActionType.REJECT]: [],
  [ActionType.ASSIGN]: [],
  [ActionType.UNASSIGN]: [],
  [ActionType.DETECT_DUPLICATE]: []
} satisfies Record<ActionType, ConfigurableScopeType[]>
