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
import { Warning } from './Warning'
import React from 'react'

const Template: Story<{ label: string }> = (args) => {
  return <Warning {...args} />
}

export default {
  title: 'Components/Interface/Warning',
  component: Warning
} as Meta

export const Default = Template.bind({})
Default.args = {
  label: 'Nothing is currently published. Awating to be published: Birth, Death'
}
