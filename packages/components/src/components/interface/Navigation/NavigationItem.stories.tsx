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
import { NavigationItem, INavigationItemProps } from './NavigationItem'
import { LeftNavigationApplicationIcons } from '../../icons/LeftNavigationApplicationIcons'
import { Activity } from '../../icons/Activity'
import { Users } from '../../icons/Users'
import { Configuration } from '../../icons/Configuration'

const Template: Story<INavigationItemProps> = (args) => (
  <NavigationItem {...args} />
)

export const itemInProgress = Template.bind({})

itemInProgress.args = {
  icon: <LeftNavigationApplicationIcons />,
  label: 'In progress',
  count: 6
}

export const itemReadyForReview = Template.bind({})

itemReadyForReview.args = {
  icon: <LeftNavigationApplicationIcons color={'orange'} />,
  label: 'Ready for review',
  count: 23
}

export const itemRequiresUpdates = Template.bind({})

itemRequiresUpdates.args = {
  icon: <LeftNavigationApplicationIcons color={'red'} />,
  label: 'Requires updates'
}

export const itemReadyToPrint = Template.bind({})

itemReadyToPrint.args = {
  icon: <LeftNavigationApplicationIcons color={'green'} />,
  label: 'Ready to print',
  count: 23
}

export const itemPerformance = Template.bind({})

itemPerformance.args = {
  icon: <Activity stroke={'#595C5F'} height={15} width={15} />,
  label: 'Performance'
}

export const itemTeam = Template.bind({})

itemTeam.args = {
  icon: <Users stroke={'#595C5F'} height={15} width={15} />,
  label: 'Team'
}

export const itemConfiguration = Template.bind({})

itemConfiguration.args = {
  icon: <Configuration />,
  label: 'Configuration',
  isSelected: true
}

export default {
  title: 'Components/Interface/NavigationItem',
  component: NavigationItem
} as Meta
