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
import { ColumnContentAlignment, GridTable } from './GridTable'
import { IColumn, IDynamicValues } from './types'
import React from 'react'

export default {
  title: 'Components/Interface/GridTable',
  component: GridTable
} as Meta

interface IProps {
  content: IDynamicValues[]
  columns: IColumn[]
  renderExpandedComponent?: (eventId: string) => React.ReactNode
  noResultText: string
  hideTableHeader?: boolean
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalItems: number
  currentPage?: number
  expandable?: boolean
  clickable?: boolean
  showPaginated?: boolean
  loading?: boolean
  loadMoreText: string
  width: number
  expanded: string[]
}

function reviewClicked() {
  alert('review clicked')
}

const list = [
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-12-10',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '5 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-11-10',
    event: 'death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '23 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-11-10',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '12 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-09-10',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-10',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '18 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-10',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '23 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '7 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-08',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '9 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '11 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-06',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '5 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '7 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '9 days ago',
    tracking_id: '1234567',
    createdAt: '2017-10-09',
    event: 'birth',
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
    label: 'Date of Application',
    width: 23,
    key: 'date_of_application'
  },
  {
    label: 'Date of event',
    width: 23,
    key: 'date_of_event'
  },
  {
    label: 'Action',
    width: 20,
    key: 'actions',
    isActionColumn: true,
    alignment: ColumnContentAlignment.CENTER
  }
]

const Template: Story<IProps> = (args) => <GridTable {...args} />
export const GridView = Template.bind({})
GridView.args = {
  content: list,
  columns,
  noResultText: 'No result to display',
  expandable: false,
  totalItems: list.length || 0,
  pageSize: list.length
}
