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
import { CircleButton, SecondaryButton } from '../buttons'
import {
  BackArrowDeepBlue,
  ForwardArrowDeepBlue,
  Hamburger,
  HelpBlue,
  DeclarationIcon
} from '../icons'
import { Stack } from '../Stack'
import { SearchBlueIcon } from '../icons/SearchBlue.stories'
import { SearchTool } from '../SearchTool'
import { noop } from 'lodash'

export default {
  title: 'Layout/AppBar',
  component: AppBar
} as ComponentMeta<typeof AppBar>

const Template: ComponentStory<typeof AppBar> = (args) => (
  <div style={{ minHeight: '150px' }}>
    <AppBar {...args} />
  </div>
)

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
      <SecondaryButton>Button</SecondaryButton>
    </Stack>
  ),
  mobileRight: <SecondaryButton>Button</SecondaryButton>
}
Default.parameters = {
  layout: 'fullscreen'
}

export const Search = Template.bind({}) as ComponentStory<typeof AppBar>
Search.args = {
  mobileLeft: (
    <CircleButton>
      <Hamburger />
    </CircleButton>
  ),
  mobileTitle: 'Search',
  mobileRight: (
    <CircleButton>
      <SearchBlueIcon />
    </CircleButton>
  ),
  desktopLeft: (
    <Stack gap={16}>
      <CircleButton>
        <BackArrowDeepBlue />
      </CircleButton>
      <CircleButton>
        <ForwardArrowDeepBlue />
      </CircleButton>
    </Stack>
  ),
  desktopCenter: (
    <SearchTool
      language="english"
      onClearText={noop}
      searchHandler={noop}
      searchTypeList={[
        {
          icon: noop,
          invertIcon: noop,
          label: 'Dhaka',
          placeHolderText: 'Dhaka',
          value: 'Dhaka'
        },
        {
          icon: noop,
          invertIcon: noop,
          label: 'Chittagong',
          placeHolderText: 'Chittagong',
          value: 'Chittagong'
        }
      ]}
    />
  ),
  desktopRight: <SecondaryButton>Button</SecondaryButton>
}

Search.parameters = {
  layout: 'fullscreen'
}

export const Declaration = Template.bind({}) as ComponentStory<typeof AppBar>

Declaration.args = {
  mobileLeft: <DeclarationIcon />,
  desktopLeft: <DeclarationIcon />,
  mobileTitle: 'Birth declaration',
  desktopTitle: 'Birth declaration',
  mobileRight: <Hamburger />,
  desktopRight: (
    <Stack gap={16}>
      <SecondaryButton>Button</SecondaryButton>
      <SecondaryButton>Button</SecondaryButton>
    </Stack>
  )
}

Declaration.parameters = { layout: 'fullscreen' }
