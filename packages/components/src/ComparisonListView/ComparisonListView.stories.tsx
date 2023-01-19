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
import { ComponentMeta, Story } from '@storybook/react'
import { ComparisonListView, IComparisonListProps } from './ComparisonListView'
import React from 'react'

export default {
  title: 'Data/Comparison List',
  component: ComparisonListView
} as ComponentMeta<typeof ComparisonListView>

const Template: Story<IComparisonListProps> = (args) => {
  return (
    <ComparisonListView {...args}>
      <ComparisonListView.Row
        label={'Label'}
        values={{ heading1: 'Data1', heading2: 'Data2' }}
      />
      <ComparisonListView.Row
        label={'Label'}
        values={{ heading1: 'Data1', heading2: 'Data2' }}
      />
      <ComparisonListView.Row
        label={'Label'}
        values={{ heading1: 'Data1', heading2: 'Data2' }}
      />
    </ComparisonListView>
  )
}

export const Default = Template.bind({})
Default.args = {
  headings: ['heading1', 'heading2']
}
