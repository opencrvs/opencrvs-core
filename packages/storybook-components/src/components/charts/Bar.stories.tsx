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
import { Bar, IBarChartProps } from './Bar'

export default {
  title: 'Components/Charts/Bar',
  component: Bar
} as Meta

const Template: Story<IBarChartProps> = args => <Bar {...args} />

export const BarChartWithEstimate = Template.bind({})
BarChartWithEstimate.args = {
  data: [
    {
      value: 500,
      label: 'Live births registered within 45 days of actual birth'
    },
    {
      value: 1000,
      label: 'Live births registered within 1 year of actual birth'
    },
    {
      value: 3000,
      label: 'Total Live Births registered',
      total: true
    },
    {
      value: 4000,
      label: 'Estimated Births in [time period]',
      estimate: true,
      description: 'Provided from 2018 population census'
    }
  ]
}

export const BarCharWithoutEstimate = Template.bind({})
BarCharWithoutEstimate.args = {
  data: [
    {
      value: 500,
      label: 'Live births registered within 45 days of actual birth'
    },
    {
      value: 1000,
      label: 'Live births registered within 1 year of actual birth'
    },
    {
      value: 3000,
      label: 'Total Live Births registered',
      total: true
    }
  ]
}
