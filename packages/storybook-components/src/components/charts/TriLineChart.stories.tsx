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
import { TriLineChart, IProps } from './TriLineChart'

export default {
  title: 'Components/Charts/TriLineChart',
  component: TriLineChart
} as Meta

const Template: Story<IProps> = args => <TriLineChart {...args} />

export const SampleTriLineChart = Template.bind({})
SampleTriLineChart.args = {
  data: [
    {
      label: 'Oct',
      registeredIn45Days: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Nov',
      registeredIn45Days: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Dec,20',
      registeredIn45Days: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Jan',
      registeredIn45Days: 0,
      totalRegistered: 0,
      totalEstimate: 17000,
      registrationPercentage: '0%'
    },
    {
      label: 'Feb',
      registeredIn45Days: 500,
      totalRegistered: 1000,
      totalEstimate: 17000,
      registrationPercentage: '10%'
    },
    {
      label: 'Mar',
      registeredIn45Days: 1000,
      totalRegistered: 2000,
      totalEstimate: 17000,
      registrationPercentage: '20%'
    },
    {
      label: 'Apr',
      registeredIn45Days: 1500,
      totalRegistered: 3000,
      totalEstimate: 17000,
      registrationPercentage: '35%'
    },
    {
      label: 'May',
      registeredIn45Days: 4000,
      totalRegistered: 6000,
      totalEstimate: 17000,
      registrationPercentage: '25%'
    },
    {
      label: 'Jun',
      registeredIn45Days: 4500,
      totalRegistered: 6500,
      totalEstimate: 17000,
      registrationPercentage: '40%'
    },
    {
      label: 'Jul',
      registeredIn45Days: 8000,
      totalRegistered: 9000,
      totalEstimate: 17000,
      registrationPercentage: '55%'
    },
    {
      label: 'Aug',
      registeredIn45Days: 6000,
      totalRegistered: 7000,
      totalEstimate: 17000,
      registrationPercentage: '43%'
    },
    {
      label: 'Sept',
      registeredIn45Days: 7500,
      totalRegistered: 8000,
      totalEstimate: 17000,
      registrationPercentage: '45%'
    }
  ],
  dataKeys: ['totalEstimate', 'totalRegistered', 'registeredIn45Days'],
  tooltipContent: (dataPoint: any) => <div></div>,
  legendContent: () => <div></div>
}
