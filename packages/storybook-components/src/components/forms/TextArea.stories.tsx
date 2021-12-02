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
import { TextArea } from './TextArea'

export default {
  title: 'Components/forms/TextArea',
  component: TextArea
} as Meta

const Template: Story<{ ignoreMediaQuery?: boolean }> = args => (
  <TextArea {...args} />
)

export const TextAreaView = Template.bind({})
TextAreaView.args = {
  ignoreMediaQuery: false
}
