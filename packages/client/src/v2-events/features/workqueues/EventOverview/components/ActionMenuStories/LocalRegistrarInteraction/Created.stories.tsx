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
import { createTRPCMsw } from '@vafanassieff/msw-trpc'
import { AppRouter } from '@events/router'
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
  getMockEvent,
  createdByOtherUserScenario
} from '../ActionMenu.common'

export default {
  ...baseMeta,
  title: 'ActionMenu/LocalRegistrar/Created'
} as Meta<typeof ActionMenu>

const createdScenariosForLocalRegistrar: Scenario[] = [
  {
    name: 'AssignedToSelf',
    recordDownloaded: true,
    actions: [ActionType.CREATE, AssignmentStatus.ASSIGNED_TO_SELF],
    expected: {
      ...getHiddenActions(),
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.DECLARE]: AssertType.ENABLED,
      [ActionType.DELETE]: AssertType.ENABLED
    }
  }
]

const stories = createStoriesFromScenarios(
  createdScenariosForLocalRegistrar,
  UserRoles.LOCAL_REGISTRAR
)

export const AssignedToSelf = stories['AssignedToSelf']

// Created by some other user
const event = getMockEvent([ActionType.CREATE], UserRoles.REGISTRATION_AGENT)

export const CreatedByOtherUser = createdByOtherUserScenario({
  event,
  role: UserRoles.LOCAL_REGISTRAR,
  expected: {
    ...getHiddenActions(),
    [ActionType.READ]: AssertType.ENABLED,
    [ActionType.DECLARE]: AssertType.DISABLED,
    [ActionType.DELETE]: AssertType.DISABLED
  }
})
