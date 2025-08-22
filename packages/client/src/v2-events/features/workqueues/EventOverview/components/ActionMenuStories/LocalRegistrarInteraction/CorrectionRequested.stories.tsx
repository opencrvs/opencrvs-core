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
import { ActionType, ClientSpecificAction } from '@opencrvs/commons/client'
import { AssignmentStatus } from '@client/v2-events/utils'
import { ActionMenu } from '../../ActionMenu'
import {
  baseMeta,
  getHiddenActions,
  createStoriesFromScenarios,
  AssertType,
  Scenario,
  UserRoles
} from '../ActionMenu.common'

export default {
  ...baseMeta,
  title: 'ActionMenu/LocalRegistrar/CorrectionRequested'
} as Meta<typeof ActionMenu>

const correctionRequestedScenariosForLocalRegistrar: Scenario[] = [
  {
    name: 'Unassigned',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.VALIDATE,
      ActionType.REGISTER,
      ActionType.UNASSIGN,
      ActionType.REQUEST_CORRECTION,
      ClientSpecificAction.REVIEW_CORRECTION_REQUEST
    ],
    expected: {
      ...getHiddenActions(),
      [ActionType.ASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.PRINT_CERTIFICATE]: AssertType.HIDDEN,
      [ActionType.REQUEST_CORRECTION]: AssertType.HIDDEN,
      [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: AssertType.DISABLED
    }
  },
  {
    name: 'AssignedToSelf',
    recordDownloaded: true,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.VALIDATE,
      ActionType.REGISTER,
      ActionType.REQUEST_CORRECTION,
      ClientSpecificAction.REVIEW_CORRECTION_REQUEST
    ],
    expected: {
      ...getHiddenActions(),
      [ActionType.UNASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.PRINT_CERTIFICATE]: AssertType.HIDDEN,
      [ActionType.REQUEST_CORRECTION]: AssertType.HIDDEN,
      [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: AssertType.ENABLED
    }
  },
  {
    name: 'AssignedToOthers',
    recordDownloaded: false,
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.DECLARE,
      ActionType.VALIDATE,
      ActionType.REGISTER,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_OTHERS,
      ActionType.REQUEST_CORRECTION,
      ClientSpecificAction.REVIEW_CORRECTION_REQUEST
    ],
    expected: {
      ...getHiddenActions(),
      [ActionType.UNASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.PRINT_CERTIFICATE]: AssertType.HIDDEN,
      [ActionType.REQUEST_CORRECTION]: AssertType.HIDDEN,
      [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: AssertType.DISABLED
    }
  }
]

const stories = createStoriesFromScenarios(
  correctionRequestedScenariosForLocalRegistrar,
  UserRoles.LOCAL_REGISTRAR
)

export const Unassigned = stories['Unassigned']
export const AssignedToSelf = stories['AssignedToSelf']
export const AssignedToOthers = stories['AssignedToOthers']
