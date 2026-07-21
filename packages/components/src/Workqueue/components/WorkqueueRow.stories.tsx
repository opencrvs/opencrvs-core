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
import React from 'react'
import { Pill } from '../../Pill'
import { Button } from '../../Button'
import { Icon } from '../../Icon'
import { SORT_ORDER } from '../Workqueue'
import {
  WorkqueueList,
  WorkqueueHeader,
  WorkqueueRow,
  IWorkqueueRowProps
} from './WorkqueueRow'

export default {
  title: 'Data/WorkqueueRow',
  component: WorkqueueRow,
  parameters: {
    docs: {
      description: {
        component:
          'Workqueue list row. Desktop shows record, sent, flags and action columns; on mobile the row stacks into a card-like layout.'
      }
    },
    layout: 'fullscreen'
  }
} as Meta

const actions = (
  <>
    <Button aria-label="Edit record" type="icon">
      <Icon name="PencilSimpleLine" />
    </Button>
    <Button aria-label="Download record" type="icon">
      <Icon name="ArrowCircleDown" />
    </Button>
  </>
)

const rows: IWorkqueueRowProps[] = [
  {
    name: (
      <>Adolph Blaine Charles Frederick &amp; David Earl Patrick Frederick</>
    ),
    meta: 'Marriage • 02 June 2022',
    sent: '1 day ago',
    flags: (
      <Pill
        label="A custom flag with a very long label that gets truncated"
        size="small"
        title="A custom flag with a very long label that gets truncated"
        type="neutral"
      />
    ),
    actions
  },
  {
    name: <>Jane Smith</>,
    meta: 'Birth • KJN342N45 • 02 June 2022',
    sent: '1 day ago',
    flags: <Pill label="Correction requested" size="small" type="active" />,
    actions
  },
  {
    name: <>Jane Smith</>,
    meta: 'Death • 02 June 2022',
    sent: '2 days ago',
    flags: <Pill label="Revocation requested" size="small" type="default" />,
    actions
  },
  {
    name: <>Luke Jones</>,
    meta: 'Birth • JKAN234M • 02 June 2022',
    sent: '3 days ago',
    actions
  },
  {
    name: <>Floyd Miles</>,
    meta: 'Birth • 23 April 2022',
    sent: '5 days ago',
    flags: <Pill label="Potential duplicate" size="small" type="inactive" />,
    actions
  }
]

const Template: Story<{ sortOrder: SORT_ORDER }> = ({ sortOrder }) => (
  <WorkqueueList>
    <WorkqueueHeader
      flags={{ label: 'Flags' }}
      record={{ label: 'Record' }}
      sent={{ label: 'Sent', isSorted: true, onSort: () => undefined }}
      sortOrder={sortOrder}
    />
    {rows.map((row, i) => (
      <WorkqueueRow key={i} {...row} onClick={() => undefined} />
    ))}
  </WorkqueueList>
)

export const Default = Template.bind({})
Default.args = { sortOrder: SORT_ORDER.DESCENDING }

export const WithIcon: Story = () => (
  <WorkqueueList>
    <WorkqueueHeader
      flags={{ label: 'Flags' }}
      record={{ label: 'Record' }}
      sent={{ label: 'Sent' }}
    />
    <WorkqueueRow
      actions={actions}
      flags={<Pill label="Pending attestation" size="small" type="pending" />}
      icon={<Icon color="currentColor" name="FileText" size="small" />}
      meta="Birth • KJN342N45 • 02 June 2022"
      name="Jane Smith"
      sent="1 day ago"
    />
  </WorkqueueList>
)
