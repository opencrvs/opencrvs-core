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

import { Action, ActionType } from '@opencrvs/commons'

export function findLastAssignmentAction(actions: Action[]) {
  return actions
    .filter(
      ({ type }) => type === ActionType.ASSIGN || type === ActionType.UNASSIGN
    )
    .reduce<
      Action | undefined
    >((latestAction, action) => (!latestAction || action.createdAt > latestAction.createdAt ? action : latestAction), undefined)
}
