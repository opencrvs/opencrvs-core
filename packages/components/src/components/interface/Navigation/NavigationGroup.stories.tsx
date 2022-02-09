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

import React from 'react'
import { Meta, Story } from '@storybook/react'
import { NavigationGroup, INavigationGroup } from './NavigationGroup'
import {
  itemConfiguration,
  itemInProgress,
  itemPerformance,
  itemReadyForReview,
  itemReadyToPrint,
  itemRequiresUpdates,
  itemTeam
} from './NavigationItem.stories'
import { NavigationItem } from './NavigationItem'
import { NavigationSubItem } from './NavigationSubItem'
import {
  subItemBranding,
  subItemCertificates,
  subItemForms
} from './NavigationSubItem.stories'

const ApplicationTemplate: Story<INavigationGroup> = (args) => (
  <div {...args}>
    <NavigationItem {...itemInProgress.args} />
    <NavigationItem {...itemReadyForReview.args} />
    <NavigationItem {...itemRequiresUpdates.args} />
    <NavigationItem {...itemReadyToPrint.args} />
  </div>
)

export const groupApplication = ApplicationTemplate.bind({})

groupApplication.args = {
  children: <ApplicationTemplate />
}

const SettingTemplate: Story<INavigationGroup> = (args) => (
  <div {...args}>
    <NavigationItem {...itemPerformance.args} />
    <NavigationItem {...itemTeam.args} />
    <NavigationItem {...itemConfiguration.args}>
      <NavigationSubItem {...subItemCertificates.args} />
      <NavigationSubItem {...subItemForms.args} />
      <NavigationSubItem {...subItemBranding.args} />
    </NavigationItem>
  </div>
)

export const groupSetting = SettingTemplate.bind({})

groupSetting.args = {
  children: <SettingTemplate />
}

export default {
  title: 'Components/Interface/NavigationGroup',
  component: NavigationGroup
} as Meta
