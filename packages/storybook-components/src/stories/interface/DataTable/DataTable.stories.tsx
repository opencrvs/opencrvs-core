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
import { DataTable, ISearchResultProps, ICustomState } from './DataTable'

export default {
  title: 'Components/Interface/DataTable/DataTable',
  component: DataTable
} as Meta

const Template: Story<ISearchResultProps> = args => <DataTable {...args} />
export const DataTableView = Template.bind({})
DataTableView.args = {
  data: [
    {
      name: 'John Doe 1',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-12-10T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'gazipur'
    },
    {
      name: 'John Doe 2',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-11-10T18:00:00.000Z',
      declaration_status: 'application',
      event: 'death',
      location: 'demra'
    },
    {
      name: 'John Doe 2',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-11-10T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dohar'
    },
    {
      name: 'John Doe 3',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-09-10T18:00:00.000Z',
      declaration_status: 'collected',
      event: 'birth',
      location: 'badda'
    },
    {
      name: 'John Doe 4',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-10T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'badda'
    },
    {
      name: 'John Doe 5',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-10T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dohar'
    },
    {
      name: 'John Doe 6',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'collected',
      event: 'birth',
      location: 'dhamrai'
    },
    {
      name: 'John Doe 7',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-08T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'dhamrai'
    },
    {
      name: 'John Doe 8',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'application',
      event: 'death',
      location: 'badda'
    },
    {
      name: 'John Doe 9',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dhamrai'
    },
    {
      name: 'John Doe 10',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-06T18:00:00.000Z',
      declaration_status: 'collected',
      event: 'birth',
      location: 'savar'
    },
    {
      name: 'John Doe 11',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'dhamrai'
    },
    {
      name: 'John Doe 12',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'application',
      event: 'death',
      location: 'dhamrai'
    },
    {
      name: 'John Doe 13',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dhamrai'
    },
    {
      name: 'John Doe 14',
      dob: 'dob',
      date_of_application: '10.10.2018',
      tracking_id: '1234567',
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'collected',
      event: 'birth',
      location: 'badda'
    }
  ],
  sortBy: {
    input: {
      label: 'Sort By'
    },
    selects: {
      name: 'Sort',
      options: [
        {
          name: 'createdAt',
          value: 'createdAt',
          options: [
            { value: 'asc', label: 'Oldest to newest' },
            { value: 'desc', label: 'Newest to oldest' }
          ]
        }
      ]
    }
  },
  filterBy: {
    input: {
      label: 'Filter By'
    },
    selects: {
      name: 'Filter',
      options: [
        {
          name: 'event',
          value: 'event',
          options: [
            { value: 'birth', label: 'Birth' },
            { value: 'death', label: 'Death' },
            { value: 'marriage', label: 'Marriage' }
          ]
        },
        {
          name: 'declaration_status',
          value: 'declaration_status',
          options: [
            { value: 'application', label: 'Application' },
            { value: 'collected', label: 'Collected' },
            { value: 'registered', label: 'Registered' }
          ]
        },
        {
          name: 'location',
          value: 'location',
          options: [
            { value: 'gazipur', label: 'Gazipur Union' },
            { value: 'badda', label: 'Badda Union' },
            { value: 'dhamrai', label: 'Dhamrai Union' },
            { value: 'savar', label: 'Savar Union' },
            { value: 'dohar', label: 'Dohar Union' }
          ]
        }
      ]
    }
  },
  cellRenderer: (data, key) => <></>,
  resultLabel: 'Results',
  noResultText: 'No result to display'
}
