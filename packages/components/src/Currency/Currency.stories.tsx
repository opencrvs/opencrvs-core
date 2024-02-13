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
import { Currency } from './Currency'

export default {
  title: 'Typography/Currency',
  component: Currency
} as Meta

const Template: Story<{}> = () => (
  <Currency value={1000} currency={'AUD'} languagesAndCountry={'en-AU'} />
)

export const CurrencyView = Template.bind({})
