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
  DeclarationIcon,
  SearchBlue,
  Phone,
  BRN,
  TrackingID
} from '../icons'
import { Stack } from '../Stack'
import { SearchTool } from '../SearchTool'
import { noop } from 'lodash'

export default {
  title: 'Layout/AppBar',
  component: AppBar,
  argTypes: {
    desktopLeft: { control: 'null' },
    desktopRight: { control: 'null' },
    desktopCenter: { control: 'null' },
    mobileLeft: { control: 'null' },
    mobileRight: { control: 'null' }
  }
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
    <Stack gap={8}>
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

export const Home = Template.bind({}) as ComponentStory<typeof AppBar>
Home.args = {
  mobileLeft: (
    <CircleButton>
      <Hamburger />
    </CircleButton>
  ),
  mobileTitle: 'Search',
  mobileRight: <SearchBlue />,
  desktopLeft: (
    <Stack gap={8}>
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
          icon: <TrackingID />,
          invertIcon: <TrackingID />,
          label: 'Tracking ID',
          placeHolderText: 'Search',
          value: 'Tracking ID'
        },
        {
          icon: <BRN />,
          invertIcon: <BRN />,
          label: 'BRN/DRN',
          placeHolderText: 'Search',
          value: 'BRN/DRN'
        },
        {
          icon: <Phone />,
          invertIcon: <Phone />,
          label: 'Phone no.',
          placeHolderText: 'Search',
          value: 'Phone no.'
        }
      ]}
    />
  ),
  desktopRight: <SecondaryButton>Button</SecondaryButton>
}

Home.parameters = {
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
    <Stack gap={8}>
      <SecondaryButton>Save</SecondaryButton>
      <SecondaryButton>Exit</SecondaryButton>
    </Stack>
  )
}

Declaration.parameters = { layout: 'fullscreen' }
