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
import { Meta } from '@storybook/react-vite'
import { List } from './index'
import { Link } from '../Link'
import { Avatar } from '../Avatar'
import { Pill } from '../Pill'
import { Icon } from '../Icon'
import { ToggleMenu } from '../ToggleMenu'

export default {
  title: 'Data/List',
  parameters: {
    docs: {
      description: {
        component: `
Use a list to show a set of things, one per row, where each row names something
and says a little about it: the fields of a declaration, a user's settings, the
members of a team, the offices under a district.

Reach for \`<Table>\` instead when the reader is comparing values down columns
and wants to sort them, total them, or filter by them.
`
      }
    }
  },
  component: List
} as Meta

const Change = (
  <Link font="reg16" key="change">
    Change
  </Link>
)

/** The fields of a record, so a reader can check them at a glance. */
export const Default = () => (
  <List>
    <List.Item label="Event" value="Birth" />
    <List.Item label="Tracking ID" value="B7X2KQ" />
    <List.Item label="Date of birth" value="12 February 2024" />
    <List.Item label="Place of birth" value="Ibombo District Office" />
  </List>
)

/** Name the columns when the values need saying what they are. */
export const WithHeader = () => (
  <List>
    <List.Header label="Field" value="Input" />
    <List.Item actions={Change} label="First name(s)" value="Peter Jonathan" />
    <List.Item actions={Change} label="Last name" value="Jones" />
    <List.Item
      actions={Change}
      label="Date of birth"
      value="12 February 2024"
    />
  </List>
)

/**
 * A field the reader may see, a field nobody filled in, and a field this
 * reader is not cleared for are three different things, and the list says
 * which is which rather than leaving a blank.
 */
export const ValueStates = () => (
  <List redactedLabel="Hidden">
    <List.Item label="Event" value="Birth" />
    <List.Item
      label="Registration number"
      placeholder="No registration number"
    />
    <List.Item label="National ID" redacted />
  </List>
)

/**
 * Somewhere to go rather than something to read: a list of districts, offices
 * or sections the reader picks from. Nothing to say about each one, so the
 * names have the full width.
 */
export const LabelsOnly = () => (
  <List>
    <List.Item label={<Link>Ibombo District Office</Link>} />
    <List.Item label={<Link>Ilanga District Office</Link>} />
    <List.Item label={<Link>Itambo District Office</Link>} />
  </List>
)

/**
 * A reader can often act on some rows and not others — change their own email
 * but not someone else's. The rows they cannot act on still line up with the
 * rows they can.
 */
export const PartialActions = () => (
  <List>
    <List.Header label="Field" value="Input" />
    <List.Item actions={Change} label="First name(s)" value="Peter Jonathan" />
    <List.Item label="Tracking ID" value="B7X2KQ" />
    <List.Item actions={Change} label="Last name" value="Jones" />
  </List>
)

/** Two things worth saying about each row, not one. */
export const TwoValueColumns = () => (
  <List>
    <List.Header label="Name" value="Role" value2="Office" />
    <List.Item label="Jane Doe" value="Registrar" value2="Ibombo" />
    <List.Item label="Kennedy Mweene" value="Field officer" value2="Lusaka" />
    <List.Item label="Pat Cummins" value="System admin" value2="Central" />
  </List>
)

/**
 * The same field on two records side by side, for a reader deciding whether
 * they are the same person. On a phone the two values stack, each keeping the
 * name of the record it came from.
 */
export const Comparison = () => (
  <List redactedLabel="Hidden">
    <List.Header
      label="Field"
      value="This record"
      value2="Possible duplicate"
    />
    <List.Item
      label="First name(s)"
      value="Peter Jonathan"
      value2="Peter John"
    />
    <List.Item
      label="Date of birth"
      placeholder2="Not provided"
      value="12 February 2024"
    />
    <List.Item label="National ID" redacted redacted2 />
  </List>
)

/** Rows usually come from data, not written out one by one. */
export const MappedRows = () => {
  const fields = [
    { id: 'event', label: 'Event', value: 'Birth' },
    { id: 'tracking', label: 'Tracking ID', value: 'B7X2KQ' },
    { id: 'dob', label: 'Date of birth', value: '12 February 2024' }
  ]

  return (
    <List>
      {fields.map((field) => (
        <React.Fragment key={field.id}>
          <List.Item actions={Change} label={field.label} value={field.value} />
        </React.Fragment>
      ))}
    </List>
  )
}

/**
 * The members of a team. Each row shows whether that account is active, and
 * offers a menu of things the reader can do to it — except on their own row,
 * which they cannot action.
 */
export const TeamMembers = () => {
  const members = [
    {
      id: 'mitchel',
      name: 'Mitchel Owen',
      role: 'Local Registrar',
      menu: true
    },
    {
      id: 'emmanuel',
      name: 'Emmanuel Mayuka',
      role: 'Administrator',
      menu: false
    }
  ]

  return (
    <List>
      <List.Header label="User" value="Role" />
      {members.map((member) => (
        <List.Item
          key={member.id}
          actions={
            <>
              <Pill label="Active" type="active" />
              {member.menu && (
                <ToggleMenu
                  id={`menu-${member.id}`}
                  menuItems={[{ label: 'Edit details', handler: () => {} }]}
                  toggleButton={
                    <Icon
                      color="primary"
                      name="DotsThreeVertical"
                      size="large"
                    />
                  }
                />
              )}
            </>
          }
          label={member.name}
          start={<Avatar aria-hidden name={member.name} size="sm" />}
          value={member.role}
        />
      ))}
    </List>
  )
}
