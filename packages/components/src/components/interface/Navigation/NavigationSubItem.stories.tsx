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
import { INavigationSubItemProps, NavigationSubItem } from './NavigationSubItem'

const Template: Story<INavigationSubItemProps> = (args) => (
  <NavigationSubItem {...args} />
)

export const subItemCertificates = Template.bind({})

subItemCertificates.args = {
  label: 'Certificates'
}

export const subItemForms = Template.bind({})

subItemForms.args = {
  label: 'Forms',
  isSelected: true
}

export const subItemBranding = Template.bind({})

subItemBranding.args = {
  label: 'Branding'
}

export default {
  title: 'Components/Interface/NavigationSubItem',
  component: NavigationSubItem
} as Meta
