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
import { Meta } from '@storybook/react'
import { DropdownMenu, IDropdownPosition } from './Dropdown'
import React from 'react'
import { Button } from '../Button'

const Template = (args: {
  position: IDropdownPosition
  offsetX: number
  offsetY: number
}) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '400px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <DropdownMenu id="story">
      <DropdownMenu.Trigger>
        <Button type="primary">Click Me</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content {...args}>
        <DropdownMenu.Label>City</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => alert('Dhaka is the capital of Bangladesh')}
        >
          Dhaka
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => alert('Helsinki is the capital of Finland')}
        >
          Helsinki
        </DropdownMenu.Item>
        <DropdownMenu.Separator weight={2} />
        <DropdownMenu.Label>Season</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => alert('Winter is cold')}
          disabled={true}
        >
          Winter
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => alert('Summer is hot')}>
          Summer
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  </div>
)
export const DropdownView = Template.bind({})

export default {
  title: 'Controls/Dropdown',
  component: DropdownView,
  argTypes: {
    position: {
      options: [
        'none',
        'top left',
        'start end',
        'block-start center',
        'inline-start block-end',
        'x-start y-end',
        'center y-self-end',
        'top span-left',
        'center span-start',
        'inline-start span-block-end',
        'y-start span-x-end',
        'top span-all',
        'block-end span-all',
        'x-self-start span-all',
        'top',
        'inline-start',
        'center',
        'span-all',
        'end'
      ] satisfies IDropdownPosition[],
      control: { type: 'radio' }
    },
    offsetX: {
      control: { default: 0, type: 'number' }
    },
    offsetY: {
      control: { default: 0, type: 'number' }
    }
  }
} as Meta
