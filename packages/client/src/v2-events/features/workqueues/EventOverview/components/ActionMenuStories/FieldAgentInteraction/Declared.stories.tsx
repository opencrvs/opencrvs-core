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
  Scenario,
  UserRoles,
  AssertType
} from '../ActionMenu.common'

export default {
  ...baseMeta,
  title: 'ActionMenu/FieldAgent/Declared'
} as Meta<typeof ActionMenu>

const declaredScenariosForFieldAgent: Scenario[] = [
  {
    name: 'Unassigned',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.UNASSIGN
    ],
    expected: {
      ...getHiddenActions(),
      ['Assign']: AssertType.ENABLED,
      ['Edit']: AssertType.DISABLED
    }
  },
  {
    name: 'AssignedToOthers',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_OTHERS
    ],
    expected: {
      ...getHiddenActions(),
      ['Edit']: AssertType.DISABLED
    }
  },
  {
    name: 'AssignedToSelf',
    recordDownloaded: true,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_SELF
    ],
    expected: {
      ...getHiddenActions(),
      ['Edit']: AssertType.ENABLED,
      ['Unassign']: AssertType.ENABLED
    }
  }
]

const stories = createStoriesFromScenarios(
  declaredScenariosForFieldAgent,
  UserRoles.FIELD_AGENT
)

export const Unassigned = stories['Unassigned']
export const AssignedToOthers = stories['AssignedToOthers']
