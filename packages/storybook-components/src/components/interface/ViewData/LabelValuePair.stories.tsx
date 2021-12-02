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
import { LabelValuePair } from '.'

interface LabelValuePairProps {
  label: string
  value: string
}

export default {
  title: 'Components/Interface/ViewData/LabelValuePair',
  component: LabelValuePair
} as Meta

const Template: Story<LabelValuePairProps> = args => (
  <LabelValuePair {...args} />
)
export const LabelValuePairView = Template.bind({})
LabelValuePairView.args = {
  label: 'Percentage of Female Birth Applications',
  value: '25%'
}
