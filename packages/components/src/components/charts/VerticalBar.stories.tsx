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
import { VerticalBar } from './VerticalBar'
import { IDataPoint } from './datapoint'

export default {
  title: 'Components/Charts/VerticalBar',
  component: VerticalBar
} as Meta

interface IVerticalBarProps {
  data: IDataPoint[]
  xAxisLabel: string
  yAxisLabel: string
}

const Template: Story<IVerticalBarProps> = (args) => <VerticalBar {...args} />

export const SampleVerticalBar = Template.bind({})
SampleVerticalBar.args = {
  data: [
    { label: '45d', value: 2100 },
    { label: '46d - 1yr', value: 2400 },
    { label: '1', value: 1398 },
    { label: '2', value: 6800 },
    { label: '3', value: 3908 },
    { label: '4', value: 4800 },
    { label: '5', value: 3800 },
    { label: '6', value: 4300 },
    { label: '7', value: 2500 },
    { label: '8', value: 5680 },
    { label: '9', value: 4980 },
    { label: '10', value: 2570 }
  ],
  xAxisLabel: 'Age (years)',
  yAxisLabel: 'Total Births Registered (%)'
}
