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
import { ActionType } from '../ActionType'
import { Action, ActionStatus } from '../ActionDocument'
import { CustomFlags, Flag } from '../EventMetadata'

const customFlagChecks: Record<
  CustomFlags,
  (sortedActions: Action[]) => boolean
> = {
  [CustomFlags.CERTIFICATE_PRINTED]: (sortedActions) => {
    return sortedActions.reduce<boolean>((prev, { type }) => {
      if (type === ActionType.PRINT_CERTIFICATE) {
        return true
      }
      if (type === ActionType.APPROVE_CORRECTION) {
        return false
      }
      return prev
    }, false)
  },
  [CustomFlags.CORRECTION_REQUESTED]: (sortedActions) => {
    // @TODO: After the correction approval/rejection is implemented, we need to update this to check if the correction request is finished
    return sortedActions.some(
      ({ type }) => type === ActionType.REQUEST_CORRECTION
    )
  }
}

export function getFlagsFromActions(actions: Action[]): Flag[] {
  const sortedActions = actions.sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  )

  const actionStatus = sortedActions.reduce(
    (actionStatuses, { type, status }) => ({
      ...actionStatuses,
      [type]: status
    }),
    {} as Record<ActionType, ActionStatus>
  )

  const flags = Object.entries(actionStatus)
    .filter(([, status]) => status !== ActionStatus.Accepted)
    .map(([type, status]) => {
      const flag = `${type.toLowerCase()}:${status.toLowerCase()}`
      return flag satisfies Flag
    })

  Object.entries(customFlagChecks).forEach(([flag, check]) => {
    if (check(sortedActions)) {
      flags.push(flag)
    }
  })

  return flags
}
