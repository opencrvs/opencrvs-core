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
import { Story, Meta } from '@storybook/react'
import { Spinner, ISpinner } from './Spinner'
import React from 'react'

const Template: Story<ISpinner> = (args) => <Spinner {...args} />

export const SpinnerExample = Template.bind({})
SpinnerExample.args = {
  id: 'Spinner',
  baseColor: '#4C68C1'
}

export default {
  title: 'Data/Spinner',
  component: Spinner
} as Meta
