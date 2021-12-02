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
import { MinusTransparent, PlusTransparent } from '../icons'
import { Legend, ILegendProps } from './Legend'

export default {
  title: 'Components/Charts/Legend',
  component: Legend
} as Meta

const Template: Story<ILegendProps> = args => <Legend {...args} />

export const SampleLegend = Template.bind({})
SampleLegend.args = {
  data: [
    {
      percentage: 17,
      value: 500,
      label: 'Live births registered within 45 days of actual birth',
      description: '500 out of 3000 total',
      categoricalData: [
        {
          name: 'female',
          label: 'Female',
          value: 280,
          icon: () => <PlusTransparent />
        },
        {
          name: 'male',
          label: 'Male',
          value: 220,
          icon: () => <MinusTransparent />
        }
      ]
    },
    {
      percentage: 33,
      value: 1000,
      label: 'Live births registered within 1 year of actual birth',
      description: '1000 out of 3000 total',
      categoricalData: [
        {
          name: 'female',
          label: 'Female',
          value: 440,
          icon: () => <PlusTransparent />
        },
        {
          name: 'male',
          label: 'Male',
          value: 560,
          icon: () => <PlusTransparent />
        }
      ]
    },
    {
      percentage: 99,
      value: 3000,
      label: 'Total Live Births registered',
      description: '3000 out of estimated 4000',
      total: true
    },
    {
      percentage: 100,
      value: 4000,
      label: 'Estimated Births in [time period]',
      estimate: true,
      description: 'Provided from 2018 population census'
    }
  ],
  smallestToLargest: true
}
