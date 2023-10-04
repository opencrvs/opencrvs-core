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
// import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Story, Meta } from '@storybook/react'
import { BreadCrumb, IBreadCrumbData, IBreadCrumbProps } from './Breadcrumb'

export default {
  title: 'Input/Breadcrumb',
  component: BreadCrumb,
  parameters: {
    docs: {
      description: {
        component: `The breadcrumb component is a wrapper container that allows the user to display the hierarchical tree of the data structure.`
      }
    }
  }
} as Meta

const Template: Story<IBreadCrumbProps> = (args) => <BreadCrumb {...args} />

export const Default = Template.bind({})

Default.args = {
  items: [
    {
      label: 'Country',
      paramId: ''
    },
    {
      label: 'State 1',
      paramId: ''
    },
    {
      label: 'District 1',
      paramId: ''
    },
    {
      label: 'Level 3',
      paramId: ''
    },
    {
      label: 'Level 4',
      paramId: ''
    }
  ],
  onSelect: (x: IBreadCrumbData) => {}
}
