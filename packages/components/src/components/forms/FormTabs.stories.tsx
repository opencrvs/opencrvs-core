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
import { FormTabs, IFormTabs } from './FormTabs'

export default {
  title: 'Components/forms/FormTabs',
  component: FormTabs
} as Meta

interface IProps {
  sections: IFormTabs[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

const sections: IFormTabs[] = [
  { id: 'generalTab', title: 'General' },
  { id: 'birthTab', title: 'Birth' },
  { id: 'generalTab', title: 'Death' }
]

const Template: Story<IProps> = (args) => <FormTabs {...args} />
export const FormTabsView = Template.bind({})
FormTabsView.args = {
  sections,
  activeTabId: 'birthTab'
}
