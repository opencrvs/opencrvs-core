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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Text } from './Text'
import { Stack } from '../Stack'
import { User } from '../icons'
import { Box } from '../Box'
import styled from 'styled-components'

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
  element: 'h1'
}

export const Heading = () => (
  <Text variant="h1" element="h1" align="center">
    The gold standard for digital civil registration
  </Text>
)

export const HeadingWithIcon = () => (
  <Stack>
    <User />
    <Text variant="h4" element="span">
      Profile page
    </Text>
  </Stack>
)

export const HeadingWithColour = () => (
  <Text variant="h4" element="h4" color="red">
    No data provided
  </Text>
)

export const Body = () => (
  <Text variant="reg16" element="p" align="center">
    OpenCRVS is highly configurable, interoperable and scalable, making it
    ideally suited for use in low resource settings. It uses standards-based and
    proven technologies to provide effective digital civil registration services
    for the long-term. An open-source, digital civil registration system
    designed to positively transform civil registration services in low-resource
    settings.
  </Text>
)

export const Caption = () => (
  <Text variant="reg12" element="p">
    OpenCRVS is highly configurable
  </Text>
)

const NarrowBox = styled(Box)`
  width: 150px;
`

export const OverflowWrap = () => (
  <>
    <Text variant="bold16" element="h4">
      No overflow
    </Text>

    <NarrowBox>
      <Text variant="reg16" element="p">
        This is text with a long string 012345678901234567890123456789
      </Text>
    </NarrowBox>

    <br />

    <Text variant="bold16" element="h4">
      Overflow anywhere
    </Text>

    <NarrowBox>
      <Text variant="reg16" element="p" overflowWrap="anywhere">
        This is text with a long string 012345678901234567890123456789
      </Text>
    </NarrowBox>
  </>
)
