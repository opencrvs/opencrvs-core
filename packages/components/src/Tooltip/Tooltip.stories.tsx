import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Tooltip, TooltipProps } from './Tooltip'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Text } from '../Text'

export default {
  title: 'Data/Tooltip',
  component: Tooltip,
  argTypes: {
    position: {
      control: {
        type: 'select',
        options: ['top', 'bottom', 'left', 'right']
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
      height: '120px', // adjust height as needed
      marginTop: '24px', // add extra space above
      marginBottom: '24px' // add extra space below
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

export const Right = Template.bind({})
Right.args = {
  content: 'View performance',
  position: 'right'
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

export const BottomRight = Template.bind({})
BottomRight.args = {
  content: 'View performance',
  position: 'bottomRight'
}

export const Left = Template.bind({})
Left.args = {
  content: 'View performance',
  position: 'left'
}

export const Top = Template.bind({})
Top.args = {
  content: 'View performance',
  position: 'top'
}
