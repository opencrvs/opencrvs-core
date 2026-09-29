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
import { Meta, Story } from '@storybook/react-vite'
import React from 'react'
import { Avatar, AvatarSize, AvatarProps } from './Avatar'
import { Stack } from '../Stack'
import { Text } from '../Text'

const SIZES: AvatarSize[] = ['sm', 'md', 'lg', 'xl']

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#8c9eb8"/>
           <stop offset="1" stop-color="#3b4a63"/>
         </linearGradient>
       </defs>
       <rect width="96" height="96" fill="url(#g)"/>
       <circle cx="48" cy="38" r="16" fill="#ffffff" opacity="0.92"/>
       <path d="M16 96c0-17 14-30 32-30s32 13 32 30z" fill="#ffffff" opacity="0.92"/>
     </svg>`
  )

export default {
  title: 'Data/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'A circular representation of a person. Resolves an uploaded photo, ' +
          'then initials, then a placeholder — without ever calling out to a ' +
          'third party. Given an `onClick` it renders as a button.'
      }
    }
  }
} as Meta

const Row: Story<AvatarProps> = (args) => (
  <Stack alignItems="center" gap={16}>
    {SIZES.map((size) => (
      <Stack key={size} alignItems="center" direction="column" gap={8}>
        <Avatar {...args} size={size} />
        <Text element="span" variant="reg12">
          {size}
        </Text>
      </Stack>
    ))}
  </Stack>
)

export const Photo = Row.bind({})
Photo.args = { name: 'Kennedy Mweene', src: PHOTO }

export const Initials = Row.bind({})
Initials.args = { name: 'Kennedy Mweene' }

export const Placeholder = Row.bind({})
Placeholder.args = {}

export const BrokenPhoto = Row.bind({})
BrokenPhoto.args = { name: 'Kennedy Mweene', src: '/does-not-exist.png' }
BrokenPhoto.parameters = {
  docs: {
    description: {
      story:
        'A photo that fails to load falls back to initials at the same ' +
        'diameter, so the avatar does not change size.'
    }
  }
}

export const Interactive = Row.bind({})
Interactive.args = {
  name: 'Kennedy Mweene',
  src: PHOTO,
  onClick: () => undefined
}
Interactive.parameters = {
  docs: {
    description: {
      story:
        'With an `onClick` the avatar is a button — hover and press dim it, ' +
        'and keyboard focus draws a ring. Tab to it to see the focus state.'
    }
  }
}
