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
import { TertiaryButton, IButtonProps } from '.'

const Template: Story<IButtonProps> = (args) => (
  <TertiaryButton {...args}>Press me</TertiaryButton>
)

export default {
  title: 'Components/Buttons/TertiaryButton',
  component: TertiaryButton,
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

export const TertiaryButtonWithIcon = Template.bind({})
TertiaryButtonWithIcon.args = {
  id: 'myButton',
  onClick: () => alert('hello'),
  align: 0,
  icon: () => (
    <svg width="29" height="14">
      <title>Group</title>
      <g
        fillRule="nonzero"
        stroke="#4C68C1"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M27 7H4.059" />
        <path strokeLinejoin="round" d="M7.17 12.355L1.762 6.948l5.304-5.303" />
      </g>
    </svg>
  )
}

export const TertiaryButtonWithoutIcon = Template.bind({})
TertiaryButtonWithoutIcon.args = {
  id: 'myButton',
  onClick: () => alert('Hello')
}
