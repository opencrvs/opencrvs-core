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
import React from 'react'
import { Meta, Story } from '@storybook/react'
import { FormTabs, IFormTabs } from './FormTabs'

export default {
  title: 'Controls/Tabs',
  component: FormTabs,
  parameters: {
    docs: {
      description: {
        component: `Tabs organize and allow navigation between groups of content that are within the same context.`
      }
    }
  }
} as Meta

interface IProps {
  sections: IFormTabs[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

const sections: IFormTabs[] = [
  { id: 'generalTab', title: 'General' },
  { id: 'birthTab', title: 'Birth' },
  { id: 'deathTab', title: 'Death' }
]

const Template: Story<IProps> = (args) => <FormTabs {...args} />
export const FormTabsView = Template.bind({})
FormTabsView.args = {
  sections,
  activeTabId: 'birthTab'
}
