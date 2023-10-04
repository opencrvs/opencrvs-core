/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Tooltip, TooltipProps } from './Tooltip'
import { Button } from '../Button'
import { Icon } from '../Icon'

export default {
  title: 'Data/Tooltip',
  component: Tooltip,
  argTypes: {
    position: {
      control: {
        type: 'select',
        options: [
          'top',
          'bottom',
          'left',
          'right',
          'topLeft',
          'topRight',
          'bottomLeft',
          'bottomRight'
        ]
      }
    }
  }
} as Meta

const ButtonContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '120px',
      marginTop: '24px',
      marginBottom: '24px'
    }}
  >
    {children}
  </div>
)

const Template: Story<TooltipProps> = (args) => (
  <ButtonContainer>
    <Tooltip {...args}>
      <Button type="icon" onClick={() => alert('Button clicked')}>
        <Icon name="Activity" size="medium" />
      </Button>
    </Tooltip>
  </ButtonContainer>
)

export const Default = Template.bind({})
Default.args = {
  content: 'View performance'
}

export const Top = Template.bind({})
Top.args = {
  content: 'View performance',
  position: 'top'
}

export const TopRight = Template.bind({})
TopRight.args = {
  content: 'View performance',
  position: 'topRight'
}

export const Right = Template.bind({})
Right.args = {
  content: 'View performance',
  position: 'right'
}

export const BottomRight = Template.bind({})
BottomRight.args = {
  content: 'View performance',
  position: 'bottomRight'
}

export const Bottom = Template.bind({})
Bottom.args = {
  content: 'View performance',
  position: 'bottom'
}

export const BottomLeft = Template.bind({})
BottomLeft.args = {
  content: 'View performance',
  position: 'bottomLeft'
}

export const Left = Template.bind({})
Left.args = {
  content: 'View performance',
  position: 'left'
}

export const TopLeft = Template.bind({})
TopLeft.args = {
  content: 'View performance',
  position: 'topLeft'
}
