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

import React, { useState } from 'react'
import { Table } from './Table'
import { ComponentMeta } from '@storybook/react'
import { SortArrow } from '../icons'
import { orderBy } from 'lodash'

export default {
  title: 'Data/Table',
  component: Table
} as ComponentMeta<typeof Table>

export const OneColumnOneRow = () => (
  <Table
    columns={[{ label: 'User', width: 100, key: 'user' }]}
    content={[{ user: 'Mike Smith' }]}
  />
)

export const TwoColumnsTwoRows = () => (
  <Table
    columns={[
      { label: 'User', width: 50, key: 'user' },
      { label: 'Start date', width: 50, key: 'time' }
    ]}
    content={[
      {
        user: 'Mike Smith',
        time: '10 April 2022'
      },
      {
        user: 'Stevie Nicks',
        time: '12 May 2021'
      }
    ]}
  />
)

export const ThreeColumnsFiveRows = () => (
  <Table
    columns={[
      { label: 'User', width: 33, key: 'user' },
      { label: 'Start date', width: 33, key: 'time' },
      { label: 'Status', width: 34, key: 'status' }
    ]}
    content={[
      {
        user: 'Mike Smith',
        time: '10 April 2022',
        status: 'Active'
      },
      {
        user: 'Stevie Nicks',
        time: '12 May 2021',
        status: 'Active'
      },
      {
        user: 'Ellie Crouch',
        time: '1 November 2020',
        status: 'Active'
      },
      {
        user: 'Jill Cross',
        time: '23 October 2021',
        status: 'Inactive'
      },
      {
        user: 'Rebecca Finch',
        time: '11 March 2021',
        status: 'Active'
      }
    ]}
  />
)

export const PaginationAndFooter = () => {
  const content = [
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '90.9%'
    },
    {
      user: 'Stevie Nicks',
      time: '12 May 2021',
      status: 'Active',
      registrations: 102,
      rating: '95.1%'
    },
    {
      user: 'Ellie Crouch',
      time: '1 November 2020',
      status: 'Active',
      registrations: 92,
      rating: '93.4%'
    },
    {
      user: 'Jill Cross',
      time: '23 October 2021',
      status: 'Inactive',
      registrations: 100,
      rating: '92.4%'
    },
    {
      user: 'Rebecca Finch',
      time: '11 March 2021',
      status: 'Active',
      registrations: 132,
      rating: '98.2%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    }
  ]

  const [currentPage, setCurrentPage] = useState(1)

  return (
    <Table
      columns={[
        { label: 'User', width: 20, key: 'user' },
        { label: 'Started', width: 20, key: 'time' },
        { label: 'Status', width: 20, key: 'status' },
        { label: 'Registrations', width: 20, key: 'registrations' },
        { label: 'Performance', width: 20, key: 'rating' }
      ]}
      footerColumns={[
        { label: '', width: 20 },
        { label: '', width: 20 },
        { label: '', width: 20 },
        { label: 'Avg. 102', width: 20 },
        { label: 'Avg. 95.4%', width: 20 }
      ]}
      pageSize={5}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page)}
      totalItems={content.length}
      content={content}
    />
  )
}

export const PaginationFooterAndSorting = () => {
  const content = [
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '90.9%'
    },
    {
      user: 'Stevie Nicks',
      time: '12 May 2021',
      status: 'Active',
      registrations: 102,
      rating: '95.1%'
    },
    {
      user: 'Ellie Crouch',
      time: '1 November 2020',
      status: 'Active',
      registrations: 92,
      rating: '93.4%'
    },
    {
      user: 'Jill Cross',
      time: '23 October 2021',
      status: 'Inactive',
      registrations: 100,
      rating: '92.4%'
    },
    {
      user: 'Rebecca Finch',
      time: '11 March 2021',
      status: 'Active',
      registrations: 132,
      rating: '98.2%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    }
  ]

  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>()

  return (
    <Table
      columns={[
        { label: 'User', width: 20, key: 'user' },
        { label: 'Started', width: 20, key: 'time' },
        { label: 'Status', width: 20, key: 'status' },
        {
          label: 'Registrations',
          width: 20,
          key: 'registrations',
          isSortable: true,
          icon: <SortArrow active={Boolean(sortOrder)} />,
          sortFunction: () => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
          }
        },
        { label: 'Performance', width: 20, key: 'rating' }
      ]}
      footerColumns={[
        { label: '', width: 20 },
        { label: '', width: 20 },
        { label: '', width: 20 },
        { label: 'Avg. 10,000', width: 20 },
        { label: 'Avg. 95.4%', width: 20 }
      ]}
      pageSize={5}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page)}
      totalItems={content.length}
      content={orderBy(content, 'visits', sortOrder)}
    />
  )
}

export const FixedWidthForMobileResponsivity = () => {
  const content = [
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '90.9%'
    },
    {
      user: 'Stevie Nicks',
      time: '12 May 2021',
      status: 'Active',
      registrations: 102,
      rating: '95.1%'
    },
    {
      user: 'Ellie Crouch',
      time: '1 November 2020',
      status: 'Active',
      registrations: 92,
      rating: '93.4%'
    },
    {
      user: 'Jill Cross',
      time: '23 October 2021',
      status: 'Inactive',
      registrations: 100,
      rating: '92.4%'
    },
    {
      user: 'Rebecca Finch',
      time: '11 March 2021',
      status: 'Active',
      registrations: 132,
      rating: '98.2%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    },
    {
      user: 'Mike Smith',
      time: '10 April 2022',
      status: 'Active',
      registrations: 80,
      rating: '92%'
    }
  ]

  const [currentPage, setCurrentPage] = useState(1)

  return (
    <Table
      columns={[
        { label: 'User', width: 20, key: 'user' },
        { label: 'Started', width: 20, key: 'time' },
        { label: 'Status', width: 20, key: 'status' },
        { label: 'Registrations', width: 20, key: 'registrations' },
        { label: 'Performance', width: 20, key: 'rating' }
      ]}
      footerColumns={[
        { label: '', width: 20 },
        { label: '', width: 20 },
        { label: '', width: 20 },
        { label: 'Avg. 102', width: 20 },
        { label: 'Avg. 95.4%', width: 20 }
      ]}
      pageSize={5}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page)}
      totalItems={content.length}
      content={content}
      fixedWidth={1100}
    />
  )
}
