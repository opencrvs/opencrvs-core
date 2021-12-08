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

import { CircleButton, IButtonProps } from '.'

interface IProps extends IButtonProps {
  dark?: boolean
}

const Template: Story<IProps> = args => <CircleButton {...args}></CircleButton>

export default {
  title: 'Components/Buttons/CircleButton',
  component: CircleButton,
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

export const CircleButtonView = Template.bind({})
CircleButtonView.args = {
  dark: true,
  onClick: () => alert('Circle button clicked'),
  children: (
    <span style={{ color: '#fff', fontSize: '40px', lineHeight: '30px' }}>
      +
    </span>
  )
}
