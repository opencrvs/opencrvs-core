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
        <Icon name="Target" size="medium" />
      </Button>
    </Tooltip>
  </ButtonContainer>
)

export const Default = Template.bind({})
Default.args = {
  content: 'Create user'
}

export const Right = Template.bind({})
Right.args = {
  content: 'Create user',
  position: 'right'
}

export const Bottom = Template.bind({})
Bottom.args = {
  content: (
    <Text variant="bold14" element="p" color="white">
      Create userCreate userCreate userCreate userCreate userCreate userCreate
      user
    </Text>
  ),
  position: 'bottom'
}

export const BottomRight = Template.bind({})
BottomRight.args = {
  content: (
    <Button type="icon" onClick={() => alert('Button clicked')}>
      <Icon name="Target" size="medium" color="white" />
    </Button>
  ),
  position: 'bottomRight'
}

export const Left = Template.bind({})
Left.args = {
  content: 'Create user',
  position: 'left'
}

export const Top = Template.bind({})
Top.args = {
  content: 'Create user',
  position: 'top'
}
