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
  hiddenActions,
  createStoriesFromScenarios,
  AssertType,
  Scenario
} from '../ActionMenu.common'

export default {
  ...baseMeta,
  title: 'ActionMenu/FieldAgent/Declared'
} as Meta<typeof ActionMenu>

const declaredScenariosForFieldAgent: Scenario[] = [
  {
    name: 'Unassigned',
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.UNASSIGN
    ],
    expected: {
      ...hiddenActions,
      [ActionType.ASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED
    }
  },
  {
    name: 'AssignedToSelf',
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_SELF
    ],
    expected: {
      ...hiddenActions,
      [ActionType.UNASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED
    }
  },
  {
    name: 'AssignedToOthers',
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_OTHERS
    ],
    expected: {
      ...hiddenActions,
      [ActionType.READ]: AssertType.ENABLED
    }
  }
]

const stories = createStoriesFromScenarios(
  declaredScenariosForFieldAgent,
  'FieldAgent'
)

export const Unassigned = stories['Unassigned']
export const AssignedToSelf = stories['AssignedToSelf']
export const AssignedToOthers = stories['AssignedToOthers']
