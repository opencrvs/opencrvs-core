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

import { Button, IButtonProps } from './Button'
import { MinusTransparent, PlusTransparent } from '../icons'
import { ICON_ALIGNMENT } from './Button'

const Template: Story<IButtonProps> = (args) => (
  <Button {...args}>{args.children}</Button>
)

export default {
  title: 'Components/Buttons/Button',
  component: Button,
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

export const LeftPlusButton = Template.bind({})
LeftPlusButton.args = {
  id: 'myButton',
  onClick: () => alert('Hello'),
  icon: () => <PlusTransparent />,
  align: ICON_ALIGNMENT.LEFT
}
export const RightMinusButton = Template.bind({})
RightMinusButton.args = {
  icon: () => <MinusTransparent />,
  align: ICON_ALIGNMENT.RIGHT
}

export const ButtonWithoutIcon = Template.bind({})
ButtonWithoutIcon.args = {
  id: 'myButton',
  onClick: () => alert('Hello'),
  children: 'Click here'
}
