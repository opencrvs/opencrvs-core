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
import type { Meta } from '@storybook/react-vite'
import {
  TestUserRole,
  ActionType,
  AssignmentStatus
} from '@opencrvs/commons/client'

import { ActionMenu } from '../../ActionMenu'
import {
  baseMeta,
  getHiddenActions,
  createStoriesFromScenarios,
  Scenario,
  AssertType
} from '../ActionMenu.common'

export default {
  ...baseMeta,
  title: 'ActionMenu/LocalRegistrar/Revoked'
} as Meta<typeof ActionMenu>

const revokedScenariosForLocalRegistrar: Scenario[] = [
  {
    name: 'Unassigned',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.REGISTER,
      ActionType.REVOKE_REGISTRATION,
      ActionType.UNASSIGN
    ],
    expected: {
      ...getHiddenActions(),
      ['Print certificate']: AssertType.HIDDEN,
      ['Request correction']: AssertType.HIDDEN,
      ['Assign']: AssertType.ENABLED,
      ['Reinstate registration']: AssertType.DISABLED
    }
  },
  {
    name: 'AssignedToSelf',
    recordDownloaded: true,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.REGISTER,
      ActionType.REVOKE_REGISTRATION,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_SELF
    ],
    expected: {
      ...getHiddenActions(),
      ['Print certificate']: AssertType.HIDDEN,
      ['Request correction']: AssertType.HIDDEN,
      ['Unassign']: AssertType.ENABLED,
      ['Reinstate registration']: AssertType.ENABLED
    }
  },
  {
    name: 'AssignedToOthers',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.REGISTER,
      ActionType.REVOKE_REGISTRATION,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_OTHERS
    ],
    expected: {
      ...getHiddenActions(),
      ['Print certificate']: AssertType.HIDDEN,
      ['Request correction']: AssertType.HIDDEN,
      ['Unassign']: AssertType.ENABLED,
      ['Reinstate registration']: AssertType.DISABLED
    }
  }
]

const stories = createStoriesFromScenarios(
  revokedScenariosForLocalRegistrar,
  TestUserRole.enum.LOCAL_REGISTRAR
)

export const Unassigned = stories['Unassigned']
export const AssignedToOthers = stories['AssignedToOthers']
export const AssignedToSelf = stories['AssignedToSelf']
