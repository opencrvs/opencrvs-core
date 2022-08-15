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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'
import { AppHeader } from '../interface'
import { LeftNavigation } from '../interface/Navigation/LeftNavigation'
import { leftNavigationView } from '../interface/Navigation/LeftNavigation.stories'
import { NavigationGroup } from '../interface/Navigation/NavigationGroup'
import {
  groupDeclaration,
  groupSetting
} from '../interface/Navigation/NavigationGroup.stories'
import { Frame } from './Frame'

export default {
  title: 'Layout/Frame',
  component: Frame
} as ComponentMeta<typeof Frame>

export const WithLeftNavigation: ComponentStory<typeof Frame> = () => (
  <Frame
    header={<AppHeader title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
  >
    Include your content here
  </Frame>
)
