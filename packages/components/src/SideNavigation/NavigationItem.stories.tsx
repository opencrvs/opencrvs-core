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
import { Story } from '@storybook/react'
import { NavigationItem, INavigationItemProps } from './NavigationItem'
import { DeclarationIconSmall } from '../icons/DeclarationIconSmall'

const Template: Story<INavigationItemProps> = (args) => (
  <NavigationItem {...args} />
)

export const itemInProgress = Template.bind({})

itemInProgress.args = {
  icon: () => <DeclarationIconSmall />,
  label: 'In progress',
  count: 6
}

export const itemReadyForReview = Template.bind({})

itemReadyForReview.args = {
  icon: () => <DeclarationIconSmall color={'orange'} />,
  label: 'Ready for review',
  count: 23,
  isSelected: true
}

export const itemRequiresUpdates = Template.bind({})

itemRequiresUpdates.args = {
  icon: () => <DeclarationIconSmall color={'red'} />,
  label: 'Requires updates'
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Layout/Side navigation/Side navigation item',
  component: NavigationItem
}
