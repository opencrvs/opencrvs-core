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
import React from 'react'
import { Story, Meta } from '@storybook/react'
import { LinkButton, IButtonProps } from '.'

const Template: Story<IButtonProps> = (args) => (
  <LinkButton {...args}>Click here</LinkButton>
)

export default {
  title: 'Components/Buttons/LinkButton',
  component: LinkButton,
  argTypes: {
    icon: {
      control: {
        type: 'select',
        options: []
      }
    },
    align: {
      control: {
        type: 'select',
        options: ['LEFT', 'RIGHT']
      }
    }
  }
} as Meta

export const LinkButtonView = Template.bind({})
LinkButtonView.args = {
  id: 'myLinkButton',
  onClick: () => alert('Hello')
}
