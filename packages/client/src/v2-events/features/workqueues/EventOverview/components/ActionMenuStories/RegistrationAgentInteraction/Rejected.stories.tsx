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
import type { Meta } from '@storybook/react'
import { ActionType } from '@opencrvs/commons/client'
import { AssignmentStatus } from '@client/v2-events/utils'
import { ActionMenu } from '../../ActionMenu'
import {
  baseMeta,
  getHiddenActions,
  createStoriesFromScenarios,
  AssertType,
  Scenario,
  UserRoles,
  REJECTED_DECLARE_AS_REVIEW
} from '../ActionMenu.common'

export default {
  ...baseMeta,
  title: 'ActionMenu/RegistrationAgent/Rejected'
} as Meta<typeof ActionMenu>

const rejectedScenariosForRegistrationAgent: Scenario[] = [
  {
    name: 'Unassigned',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.REJECT,
      ActionType.UNASSIGN
    ],
    expected: {
      ...getHiddenActions(),
      [ActionType.ASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [REJECTED_DECLARE_AS_REVIEW]: AssertType.DISABLED,
      [ActionType.ARCHIVE]: AssertType.DISABLED
    }
  },
  {
    name: 'AssignedToSelf',
    recordDownloaded: true,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.REJECT
    ],
    expected: {
      ...getHiddenActions(),
      [ActionType.UNASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [REJECTED_DECLARE_AS_REVIEW]: AssertType.ENABLED,
      [ActionType.ARCHIVE]: AssertType.ENABLED
    }
  },
  {
    name: 'AssignedToOthers',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_OTHERS,
      ActionType.DECLARE,
      ActionType.REJECT
    ],
    expected: {
      ...getHiddenActions(),
      [ActionType.READ]: AssertType.ENABLED,
      [REJECTED_DECLARE_AS_REVIEW]: AssertType.DISABLED,
      [ActionType.ARCHIVE]: AssertType.DISABLED
    }
  }
]

const stories = createStoriesFromScenarios(
  rejectedScenariosForRegistrationAgent,
  UserRoles.REGISTRATION_AGENT
)

export const Unassigned = stories['Unassigned']
export const AssignedToSelf = stories['AssignedToSelf']
export const AssignedToOthers = stories['AssignedToOthers']
