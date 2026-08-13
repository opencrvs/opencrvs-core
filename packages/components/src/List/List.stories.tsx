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

export default {
  title: 'Data/List',
  parameters: {
    docs: {
      description: {
        component: `
\`<List>\` is a vertical list of label / value rows — a record's fields, a set of
settings, a team's users. Each row is one thing: the label names it, the value
columns describe it, and any actions apply to it.

Reach for \`<Table>\` instead where the reader compares values down a grid of
columns that carry their own affordances — click-to-sort, totals, per-column
filters.

Which optional columns exist is derived from the rows, so every row renders the
same cells and the columns line up. A list with actions on only some rows keeps
its value column at the same x throughout.
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

/** A record's fields. */
export const Default = () => (
  <List>
    <List.Item label="Event" value="Birth" />
    <List.Item label="Tracking ID" value="B7X2KQ" />
    <List.Item label="Date of birth" value="12 February 2024" />
    <List.Item label="Place of birth" value="Ibombo District Office" />
  </List>
)

/** Column names above the rows, on the same grid. */
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
 * The three states of a value column are distinct and must not be rendered
 * alike: a value; no value; a value the reader is not permitted to see.
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
 * A list whose rows are only labels — a set of places to navigate into. No row
 * carries a value, so there is no value column and the labels take the width
 * rather than sitting against an empty half.
 */
export const LabelsOnly = () => (
  <List>
    <List.Item label={<Link>Ibombo District Office</Link>} />
    <List.Item label={<Link>Ilanga District Office</Link>} />
    <List.Item label={<Link>Itambo District Office</Link>} />
  </List>
)

/**
 * Actions on only some rows. The trailing gutter is reserved for the whole
 * table, so every value sits at the same x.
 */
export const PartialActions = () => (
  <List>
    <List.Header label="Field" value="Input" />
    <List.Item actions={Change} label="First name(s)" value="Peter Jonathan" />
    <List.Item label="Tracking ID" value="B7X2KQ" />
    <List.Item actions={Change} label="Last name" value="Jones" />
  </List>
)

/** A second attribute of the row's subject. */
export const TwoValueColumns = () => (
  <List>
    <List.Header label="Name" value="Role" value2="Office" />
    <List.Item label="Jane Doe" value="Registrar" value2="Ibombo" />
    <List.Item label="Kennedy Mweene" value="Field officer" value2="Lusaka" />
    <List.Item label="Pat Cummins" value="System admin" value2="Central" />
  </List>
)

/**
 * The same field for two records. Each column resolves independently, so an
 * empty column says so rather than rendering blank. Narrow the viewport to see
 * each value take its column's name.
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

/** Rows may be mapped and wrapped in fragments; the columns still derive. */
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
