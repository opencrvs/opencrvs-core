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
import {
  ListViewSimplified,
  ListViewItemSimplified
} from './ListViewSimplified'
import React from 'react'
import { ToggleMenu } from '../ToggleMenu'
import { VerticalThreeDots, AvatarSmall, AvatarLarge } from '../../icons'
import { LinkButton, PrimaryButton } from '../../buttons'
import { Pill } from '../Pill'

const Template: Story = ({ children, ...args }) => {
  return <ListViewSimplified {...args}>{children}</ListViewSimplified>
}

export default {
  title: 'Components/Interface/ListViewSimplified',
  component: ListViewSimplified
} as Meta

const toggleMenu = (
  <ToggleMenu
    id="toggleMenu"
    key="toggleMenu"
    toggleButton={<VerticalThreeDots />}
    menuItems={[
      {
        label: 'Item 1',
        handler: () => {
          alert('Item 1')
        }
      }
    ]}
  />
)

const linkButton = (
  <LinkButton key="linkButton" size="medium">
    Change
  </LinkButton>
)

const linkLabel = (i: number) => (
  <LinkButton key="linkButton" size="medium">
    Link {i}
  </LinkButton>
)

const button = (
  <PrimaryButton key="primaryButton" size="medium">
    Click here
  </PrimaryButton>
)

const pill = <Pill label="Active" type="active" />

export const Default = Template.bind({})
Default.args = {
  bottomBorder: true,
  children: (
    <>
      <ListViewItemSimplified label={linkLabel(1)} value="Value 1" />
      <ListViewItemSimplified
        label="A very long label to show what happens when text overflows"
        value="A very long value to show what happens when text overflows"
        actions={[linkButton]}
      />
      <ListViewItemSimplified
        label={linkLabel(3)}
        value="Value 3"
        actions={[button, toggleMenu]}
      />
      <ListViewItemSimplified
        label="Label 4"
        value="Value 4"
        actions={[toggleMenu]}
      />
      <ListViewItemSimplified
        label="Label 5"
        value={<AvatarLarge />}
        actions={[linkButton, toggleMenu]}
      />
    </>
  )
}

export const WithAvatar = Template.bind({})
WithAvatar.args = {
  children: (
    <>
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="Name of user"
        value="Value 1"
        actions={[pill, toggleMenu]}
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="A very long label to show what happens when text overflows"
        value="A very long value to show what happens when text overflows"
        actions={[linkButton]}
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="Name of user"
        value="Value 3"
        actions={[toggleMenu]}
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="Name of user"
        value="Value 4"
        actions={[pill, toggleMenu]}
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="Name of user"
        value="Value 5"
        actions={[toggleMenu]}
      />
    </>
  )
}
