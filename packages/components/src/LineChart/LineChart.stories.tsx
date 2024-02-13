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
import { ComponentStory, Meta } from '@storybook/react'
import { LineChart } from './LineChart'

export default {
  title: 'Data/Line chart',
  component: LineChart
} as Meta

const Template: ComponentStory<typeof LineChart> = (args) => (
  <LineChart {...args} />
)

export const Default = Template.bind({})
Default.args = {
  data: [
    {
      label: 'Oct',
      registeredInTargetDays: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Nov',
      registeredInTargetDays: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Dec,20',
      registeredInTargetDays: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Jan',
      registeredInTargetDays: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Feb',
      registeredInTargetDays: 500,
      totalRegistered: 1000,
      totalEstimate: 17000,
      registrationPercentage: '10%'
    },
    {
      label: 'Mar',
      registeredInTargetDays: 1000,
      totalRegistered: 2000,
      totalEstimate: 17000,
      registrationPercentage: '20%'
    },
    {
      label: 'Apr',
      registeredInTargetDays: 1500,
      totalRegistered: 3000,
      totalEstimate: 17000,
      registrationPercentage: '35%'
    },
    {
      label: 'May',
      registeredInTargetDays: 4000,
      totalRegistered: 6000,
      totalEstimate: 17000,
      registrationPercentage: '25%'
    },
    {
      label: 'Jun',
      registeredInTargetDays: 4500,
      totalRegistered: 6500,
      totalEstimate: 17000,
      registrationPercentage: '40%'
    },
    {
      label: 'Jul',
      registeredInTargetDays: 8000,
      totalRegistered: 9000,
      totalEstimate: 17000,
      registrationPercentage: '55%'
    },
    {
      label: 'Aug',
      registeredInTargetDays: 6000,
      totalRegistered: 7000,
      totalEstimate: 17000,
      registrationPercentage: '43%'
    },
    {
      label: 'Sept',
      registeredInTargetDays: 7500,
      totalRegistered: 8000,
      totalEstimate: 17000,
      registrationPercentage: '45%'
    }
  ],
  dataKeys: ['totalEstimate', 'totalRegistered', 'registeredInTargetDays'],
  tooltipContent: (dataPoint: unknown) => <div />,
  legendContent: () => <div />
}
