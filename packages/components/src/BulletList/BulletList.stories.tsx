import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import { BulletList, BulletListProps } from './BulletList'

export default {
  title: 'Typography/Bullet List',
  component: BulletList
} as Meta

const Template: Story<BulletListProps> = (args) => <BulletList {...args} />

export const Default = Template.bind({})
Default.args = {
  items: ['Birth', 'Death', 'Marriage', 'Adoption', 'Divorce'],
  font: 'reg18'
}
