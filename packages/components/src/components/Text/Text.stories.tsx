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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Text } from './Text'
import { Stack } from '../Stack'
import { UserIcon } from '../icons/User.stories'

export default {
  title: 'Typography/Text',
  component: Text
} as ComponentMeta<typeof Text>

const Template: ComponentStory<typeof Text> = (args) => (
  <Text {...args}>Welcome to OpenCRVS</Text>
)

export const Default = Template.bind({})
Default.args = {
  variant: 'h1',
  as: 'h1'
}

export const Heading = () => (
  <Stack direction="column" alignItems="flex-start">
    <Text variant="hero" element="h1">
      The gold standard for digital...
    </Text>
    <Text variant="h1" element="h2">
      The gold standard for digital civil registration
    </Text>
    <Text variant="h2" element="h3">
      The gold standard for digital civil registration
    </Text>
    <Text variant="h3" element="h4">
      The gold standard for digital civil registration
    </Text>
    <Text variant="h4" element="h4">
      The gold standard for digital civil registration
    </Text>
  </Stack>
)

export const HeadingWithIcon = () => (
  <Stack>
    <UserIcon />
    <Text variant="h4" element="span">
      Profile page
    </Text>
  </Stack>
)

export const Body = () => (
  <Stack direction="column" alignItems="flex-start">
    <Text variant="reg18" element="p">
      The gold standard for digital civil registration
    </Text>
    <Text variant="bold18" element="p">
      The gold standard for digital civil registration
    </Text>
    <Text variant="reg16" element="p">
      The gold standard for digital civil registration
    </Text>
    <Text variant="bold16" element="p">
      The gold standard for digital civil registration
    </Text>
    <Text variant="reg14" element="p">
      The gold standard for digital civil registration
    </Text>
    <Text variant="bold14" element="p">
      The gold standard for digital civil registration
    </Text>
    <Text variant="reg12" element="p">
      The gold standard for digital civil registration
    </Text>
    <Text variant="bold12" element="p">
      The gold standard for digital civil registration
    </Text>
  </Stack>
)
