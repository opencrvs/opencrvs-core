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
import { Meta, Story } from '@storybook/react'
import { SectionDrawer } from '.'
import React from 'react'

interface IProps {
  title: string
  linkText: string
  expandable?: boolean
  linkClickHandler: () => void
  expansionButtonHandler: () => void
  isExpanded: boolean
  visited?: boolean
}

const Template: Story<IProps> = (args) => (
  <SectionDrawer {...args}>Section information populates here</SectionDrawer>
)

export const SectionDrawerView = Template.bind({})
SectionDrawerView.args = {
  title: "Child's details",
  expandable: true,
  linkText: 'Edit',
  isExpanded: false,
  linkClickHandler: () => alert('Link Clicked'),
  expansionButtonHandler: () => alert('Expansion clicked')
}
export default {
  title: 'Components/Interface/SectionDrawer',
  component: SectionDrawer
} as Meta
