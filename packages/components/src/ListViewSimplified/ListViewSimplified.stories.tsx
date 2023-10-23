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
import { Meta, Story } from '@storybook/react'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from './ListViewSimplified'
import React from 'react'
import { ToggleMenu } from '../ToggleMenu'
import { AvatarSmall, AvatarLarge } from '../icons'
import { Icon } from '../Icon'
import { Pill } from '../Pill'
import styled from 'styled-components'
import { Link } from '../Link'
import { Button } from '../Button'

const Template: Story = ({ children, ...args }) => {
  return <ListViewSimplified {...args}>{children}</ListViewSimplified>
}

export default {
  title: 'Data/List view',
  component: ListViewSimplified
} as Meta

const toggleMenu = (
  <ToggleMenu
    id="toggleMenu"
    key="toggleMenu"
    toggleButton={
      <Icon name="DotsThreeVertical" color="primary" size="large" />
    }
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
  <Link font="reg14" key="linkButton">
    Change
  </Link>
)

const linkLabel = (i: number) => <Link key="linkButton">Link {i}</Link>

const button = (
  <Button type="primary" key="primaryButton" size="medium">
    Click here
  </Button>
)

const pill = <Pill label="Active" type="active" />

const TopAlignedLabel = styled.span`
  align-self: start;
  padding-top: 8px;
`

const TopAlignedActions = styled.div`
  align-self: start;
  display: flex;
  gap: 8px;
`

export const Default = Template.bind({})
Default.args = {
  bottomBorder: true,
  children: (
    <>
      <ListViewItemSimplified label={linkLabel(1)} value="Value 1" />
      <ListViewItemSimplified
        label="A very long label to show what happens when text overflows. A very long label to show what happens when text overflows"
        value="A very long value to show what happens when text overflows"
        actions={linkButton}
      />
      <ListViewItemSimplified
        label="A very long label to show what happens when text overflows"
        value="A very long value to show what happens when text overflows"
        actions={linkButton}
      />
      <ListViewItemSimplified
        label={linkLabel(3)}
        value="Value 3"
        actions={
          <>
            {button}
            {toggleMenu}
          </>
        }
      />
      <ListViewItemSimplified
        label="Label 4"
        value="Value 4"
        actions={toggleMenu}
      />
      <ListViewItemSimplified label="Label 4" actions={toggleMenu} />
      <ListViewItemSimplified
        label={<TopAlignedLabel>Label 5</TopAlignedLabel>}
        value={<AvatarLarge />}
        actions={
          <TopAlignedActions>
            {linkButton}
            {toggleMenu}
          </TopAlignedActions>
        }
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
        actions={
          <>
            {pill}
            {toggleMenu}
          </>
        }
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="A very long label to show what happens when text overflows"
        value="A very long value to show what happens when text overflows"
        actions={linkButton}
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="Name of user"
        value="Value 3"
        actions={toggleMenu}
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="Name of user"
        value="Value 4"
        actions={
          <>
            {pill}
            {toggleMenu}
          </>
        }
      />
      <ListViewItemSimplified
        image={<AvatarSmall />}
        label="Name of user"
        value="Value 5"
        actions={toggleMenu}
      />
    </>
  )
}
export const PlainList = Template.bind({})
PlainList.args = {
  children: (
    <>
      <ListViewItemSimplified label="Name of user" actions={linkButton} />
      <ListViewItemSimplified
        label="A very long label to show what happens when text overflows"
        actions={linkButton}
      />
      <ListViewItemSimplified label="Name of user" actions={toggleMenu} />
      <ListViewItemSimplified label="Name of user" actions={linkButton} />
      <ListViewItemSimplified label="Name of user" actions={toggleMenu} />
    </>
  )
}
