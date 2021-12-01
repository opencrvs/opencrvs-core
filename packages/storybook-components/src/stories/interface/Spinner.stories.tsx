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
import { Story, Meta } from '@storybook/react'
import { Spinner, ISpinner } from './Spinner'

const Template: Story<ISpinner> = args => <Spinner {...args} />

export const SpinnerExample = Template.bind({})
SpinnerExample.args = {
  id: 'Spinner',
  baseColor: '#4C68C1'
}

export default {
  title: 'Components/Interface/Spinner',
  component: Spinner
} as Meta
