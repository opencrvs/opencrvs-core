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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Workqueue } from './Workqueue'
import { DeclarationIcon } from '../icons'
import React from 'react'

export default {
  title: 'Data/Workqueue',
  component: Workqueue
} as ComponentMeta<typeof Workqueue>

export const Empty: ComponentStory<typeof Workqueue> = () => (
  <Workqueue
    content={[]}
    columns={columns}
    noResultText="No records require review"
  />
)

function reviewClicked() {
  alert('review clicked')
}

const list = [
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-12-10',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '5 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-11-10',
    event: 'Death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '23 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-11-10',
    event: 'Marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '12 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-09-10',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-10',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '18 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-10',
    event: 'Marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '23 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '7 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-08',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '9 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'Death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '11 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'Marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-06',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '5 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'Death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '7 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'Marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    icon: <DeclarationIcon color="orange" />,
    date_of_declaration: '9 days ago',
    tracking_id: '1234567',
    createdAt: '2017-10-09',
    event: 'Birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  }
]

const columns = [
  {
    width: 10,
    key: 'icon'
  },
  {
    label: 'Type',
    width: 14,
    key: 'event'
  },
  {
    label: 'Tracking ID',
    width: 20,
    key: 'tracking_id'
  },
  {
    label: 'Date of Declaration',
    width: 23,
    key: 'date_of_declaration'
  },
  {
    label: 'Date of event',
    width: 23,
    key: 'date_of_event'
  },
  {
    width: 20,
    key: 'actions',
    isActionColumn: true
  }
]

export const DefaultUsage: ComponentStory<typeof Workqueue> = (args) => (
  <Workqueue {...args} />
)

DefaultUsage.args = {
  content: list,
  columns,
  noResultText: 'No result to display'
}
