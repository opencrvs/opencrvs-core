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
import { Button } from '../Button'
import {
  BackArrow,
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
    <Button type="icon" size="medium" aria-label="Go back">
      <BackArrow />
    </Button>
  ),
  mobileLeft: (
    <Button type="icon" size="medium" aria-label="Go back">
      <BackArrow />
    </Button>
  ),
  desktopRight: (
    <Stack gap={8}>
      <Button type="icon">
        <HelpBlue>Button</HelpBlue>
      </Button>
      <Button type="secondary">Button</Button>
      <Button type="secondary">Button</Button>
    </Stack>
  ),
  mobileRight: <Button type="secondary">Button</Button>
}
Default.parameters = {
  layout: 'fullscreen'
}

export const Home = Template.bind({}) as ComponentStory<typeof AppBar>
Home.args = {
  mobileLeft: (
    <Button type="icon" aria-label="Go back">
      <Hamburger />
    </Button>
  ),
  mobileTitle: 'Search',
  mobileRight: <SearchBlue />,
  desktopLeft: (
    <Stack gap={4}>
      <Button type="icon" size="medium" icon aria-label="Go back">
        <BackArrow />
      </Button>
      <Button type="icon" size="medium" icon aria-label="Go forward">
        <ForwardArrowDeepBlue />
      </Button>
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
  desktopRight: <Button type="secondary">Button</Button>
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
      <Button type="secondary">Save</Button>
      <Button type="secondary">Exit</Button>
    </Stack>
  )
}

Declaration.parameters = { layout: 'fullscreen' }
