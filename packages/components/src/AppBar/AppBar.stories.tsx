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
import { AppBar } from './AppBar'
import { Button } from '../Button'
import {
  Hamburger,
  DeclarationIcon,
  SearchBlue,
  Phone,
  BRN,
  TrackingID
} from '../icons'
import { Stack } from '../Stack'
import { SearchTool } from '../SearchTool'
import { noop } from 'lodash'
import { Icon } from '../Icon'

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
      <Icon name="ArrowLeft" size="medium" />
    </Button>
  ),
  mobileLeft: (
    <Button type="icon" size="medium" aria-label="Go back">
      <Icon name="ArrowLeft" size="medium" />
    </Button>
  ),
  desktopRight: (
    <Stack gap={8}>
      <Button type="icon" size="medium">
        <Icon name="Target" size="medium" />
      </Button>
      <Button type="secondary" size="medium">
        Exit
      </Button>
      <Button type="primary" size="medium">
        Save
      </Button>
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
      <Icon name="List" size="medium" />
    </Button>
  ),
  mobileTitle: 'Search',
  mobileRight: <Icon name="MagnifyingGlass" size="medium" />,
  desktopLeft: (
    <Stack gap={4}>
      <Button type="icon" size="medium" aria-label="Go back">
        <Icon name="ArrowLeft" size="medium" />
      </Button>
      <Button type="icon" size="medium" aria-label="Go forward">
        <Icon name="ArrowRight" size="medium" />
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
          icon: <Icon name="Target" size="medium" color="grey600" />,
          label: 'Tracking ID',
          placeHolderText: 'Search',
          value: 'Tracking ID'
        },
        {
          icon: <Icon name="Medal" size="medium" color="grey600" />,
          label: 'Registration No.',
          placeHolderText: 'Search',
          value: 'Registration No.'
        },
        {
          icon: <Icon name="Phone" size="medium" color="grey600" />,
          label: 'Phone no.',
          placeHolderText: 'Search',
          value: 'Phone no.'
        }
      ]}
    />
  ),
  desktopRight: (
    <Button type="secondary" size="medium">
      Exit
    </Button>
  )
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
      <Button type="secondary" size="medium">
        Save
      </Button>
      <Button type="primary" size="medium">
        Exit
      </Button>
    </Stack>
  )
}

Declaration.parameters = { layout: 'fullscreen' }
