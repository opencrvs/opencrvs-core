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
import { AppBar } from './AppBar'
import { CircleButton, PrimaryButton, SecondaryButton } from '../buttons'
import { BackArrowDeepBlue, HelpBlue } from '../icons'
import { Stack } from '../Stack'

export default {
  title: 'Layout/AppBar',
  component: AppBar
} as ComponentMeta<typeof AppBar>

const Template: ComponentStory<typeof AppBar> = (args) => <AppBar {...args} />

export const Default = Template.bind({}) as ComponentStory<typeof AppBar>
Default.args = {
  desktopTitle: 'OpenCRVS',
  mobileTitle: 'OpenCRVS',
  desktopLeft: (
    <CircleButton>
      <BackArrowDeepBlue />
    </CircleButton>
  ),
  mobileLeft: (
    <CircleButton>
      <BackArrowDeepBlue />
    </CircleButton>
  ),
  desktopRight: (
    <Stack gap={16}>
      <CircleButton>
        <HelpBlue>Button</HelpBlue>
      </CircleButton>
      <SecondaryButton>Button</SecondaryButton>
      <PrimaryButton>Button</PrimaryButton>
    </Stack>
  ),
  mobileRight: (
    <Stack gap={16}>
      <CircleButton>
        <HelpBlue>Button</HelpBlue>
      </CircleButton>
      <SecondaryButton>Button</SecondaryButton>
      <PrimaryButton>Button</PrimaryButton>
    </Stack>
  )
}
