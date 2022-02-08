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
import { ActionPageLight } from './ActionPageLight'
import { Box } from './Box'
import React from 'react'

interface IProps {
  title?: string
  backLabel?: string
  icon?: () => React.ReactNode
  goBack: () => void
}

const Template: Story<IProps> = (args) => (
  <ActionPageLight {...args}>
    <Box>
      <h3>Children elements will go here</h3>
    </Box>
  </ActionPageLight>
)
export const ActionPageLightView = Template.bind({})
ActionPageLightView.args = {
  title: 'Register',
  backLabel: 'BACK',
  goBack: () => alert('Back button clicked')
}

export default {
  title: 'Components/Interface/ActionPageLight',
  component: ActionPageLight
} as Meta
