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
import { ComponentMeta, Story } from '@storybook/react'
import { ComparisonListView, IComparisonListProps } from './ComparisonListView'
import { Text } from '../Text'

export default {
  title: 'Data/Comparison List',
  component: ComparisonListView
} as ComponentMeta<typeof ComparisonListView>

const Template: Story<IComparisonListProps> = (args) => {
  return (
    <ComparisonListView {...args}>
      <ComparisonListView.Row
        label={
          <Text variant="bold16" element="span">
            Label
          </Text>
        }
        heading={{ right: 'Heading1', left: 'Heading2' }}
        leftValue={<div>Data2</div>}
        rightValue={<div>Data1</div>}
        key={'d1'}
      />
      <ComparisonListView.Row
        label={
          <Text variant="bold16" element="span">
            Label
          </Text>
        }
        heading={{ right: 'Heading1', left: 'Heading2' }}
        leftValue={<div>Data2</div>}
        rightValue={<div>Data1</div>}
        key={'d2'}
      />
      <ComparisonListView.Row
        label={
          <Text variant="bold16" element="span">
            Label
          </Text>
        }
        heading={{ right: 'Heading1', left: 'Heading2' }}
        leftValue={<div>Data2</div>}
        rightValue={<div>Data1</div>}
        key={'d3'}
      />
    </ComparisonListView>
  )
}

export const Default = Template.bind({})
Default.args = {
  headings: [
    <Text variant="reg14" element="span" color="grey500">
      Heading1
    </Text>,
    <Text variant="reg14" element="span" color="grey500">
      Heading2
    </Text>
  ]
}
