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
import { Meta, Story } from '@storybook/react'
import { Content } from './Content'
import React, { ReactElement } from 'react'
import { LinkButton, PrimaryButton, SecondaryButton } from '../buttons'
import { GridView } from './GridTable/GridTable.stories'
import { DeclarationIcon } from '../icons'

interface IProps {
  icon?: () => React.ReactNode
  title?: string
  topActionButtons?: ReactElement[]
  subtitle?: string
  children?: React.ReactNode
  bottomActionButtons?: ReactElement[]
  maxWidth?: '778px' | '1140px'
}

const Template: Story<IProps> = (args) => (
  <Content {...args}>
    <GridView {...GridView.args} />
  </Content>
)
export const ContentView = Template.bind({})
ContentView.args = {
  icon: () => <DeclarationIcon />,
  title: 'Register',
  topActionButtons: [
    <SecondaryButton
      key="1"
      id="myButton"
      onClick={() => {
        alert('Clicked')
      }}
    >
      Press me
    </SecondaryButton>,
    <LinkButton key="2">Click</LinkButton>
  ],
  subtitle:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  bottomActionButtons: [
    <PrimaryButton
      key="1"
      id="myButton"
      onClick={() => {
        alert('Clicked')
      }}
    >
      Press me
    </PrimaryButton>
  ],
  size: 'normal'
}

export default {
  title: 'Components/Interface/Content',
  component: Content
} as Meta
