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
import { CircleButton } from './CircleButton'
import { ArrowUp } from '../icons'

interface IProps {
  dark?: boolean
  size?: 'small' | 'medium' | 'large'
}

const Template: Story<IProps> = ({ size }) => (
  <CircleButton size={size}>
    <ArrowUp />
  </CircleButton>
)

export default {
  title: 'Components/Buttons/CircleButton',
  component: CircleButton,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium', 'large']
      }
    }
  }
} as Meta

export const Large = Template.bind({})

export const Medium = Template.bind({})

Medium.args = {
  size: 'medium'
}

export const Small = Template.bind({})

Small.args = {
  size: 'small'
}
