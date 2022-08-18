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
    columns={[{ label: 'Lunch places', width: 100, key: 'lunchPlace' }]}
    content={[{ lunchPlace: 'The Greasy Spoon' }]}
  />
)

export const TwoColumnsTwoRows = () => (
  <Table
    columns={[
      { label: 'Lunch places', width: 50, key: 'place' },
      { label: 'Rating', width: 50, key: 'rating' }
    ]}
    content={[
      { place: 'The Greasy Spoon', rating: '4 stars' },
      { place: 'The Dinner Diner', rating: '2 stars' }
    ]}
  />
)

export const ThreeColumnsFiveRows = () => (
  <Table
    columns={[
      { label: 'Lunch places', width: 40, key: 'place' },
      { label: 'Rating', width: 20, key: 'rating' },
      { label: 'Lunch time', width: 40, key: 'time' }
    ]}
    content={[
      { place: 'The Greasy Spoon', rating: '4 stars', time: '10 am - 2 pm' },
      { place: 'The Dinner Diner', rating: '2 stars', time: '10 am - 1 pm' },
      { place: 'Pizzeria Uno', rating: '5 stars', time: '10 am - 1 pm' },
      { place: 'The Krusty Krab', rating: '3 stars', time: '10 am - 2 pm' },
      { place: 'Steak Saloon', rating: '1 star', time: '9 am - 11 am' }
    ]}
  />
)

export const PaginationAndFooter = () => {
  const content = [
    {
      place: 'The Greasy Spoon',
      rating: '4 stars',
      time: '10 am - 2 pm',
      visits: 2,
      isAccessible: 'Yes'
    },
    {
      place: 'The Dinner Diner',
      rating: '2 stars',
      time: '10 am - 1 pm',
      visits: 1,
      isAccessible: 'Yes'
    },
    {
      place: 'Pizzeria Uno',
      rating: '5 stars',
      time: '10 am - 1 pm',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'The Krusty Krab',
      rating: '3 stars',
      time: '10 am - 2 pm',
      visits: 3,
      isAccessible: 'Yes'
    },
    {
      place: 'Steak Saloon',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 5,
      isAccessible: 'Yes'
    },
    {
      place: 'Brasserie',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 5,
      isAccessible: 'Yes'
    },
    {
      place: 'Bistro',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 2,
      isAccessible: 'Yes'
    },
    {
      place: 'Tapas Bar',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 9,
      isAccessible: 'Yes'
    },
    {
      place: 'Italian Restaurant',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'Steakhouse',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 12,
      isAccessible: 'Yes'
    },
    {
      place: 'Seafood Restaurant',
      rating: '1 star',
      time: '8 am - 11 am',
      visits: 20,
      isAccessible: 'Yes'
    },
    {
      place: 'Indian Restaurant',
      rating: '1 star',
      time: '11 am - 1 pm',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'French Restaurant',
      rating: '1 star',
      time: '9 am - 2 pm',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'Bistro-Style Diner',
      rating: '1 star',
      time: '9 am - 3 pm',
      visits: 15,
      isAccessible: 'Yes'
    }
  ]

  const [currentPage, setCurrentPage] = useState(1)

  return (
    <Table
      columns={[
        { label: 'Lunch places', width: 20, key: 'place' },
        { label: 'Rating', width: 20, key: 'rating' },
        { label: 'Lunch time', width: 20, key: 'time' },
        { label: 'Times visited', width: 20, key: 'visits' },
        { label: 'Wheelchair accessible?', width: 20, key: 'isAccessible' }
      ]}
      footerColumns={[
        { label: 'Note that the lunch times might have changed', width: 100 }
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
      place: 'The Greasy Spoon',
      rating: '4 stars',
      time: '10 am - 2 pm',
      visits: 2,
      isAccessible: 'Yes'
    },
    {
      place: 'The Dinner Diner',
      rating: '2 stars',
      time: '10 am - 1 pm',
      visits: 1,
      isAccessible: 'Yes'
    },
    {
      place: 'Pizzeria Uno',
      rating: '5 stars',
      time: '10 am - 1 pm',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'The Krusty Krab',
      rating: '3 stars',
      time: '10 am - 2 pm',
      visits: 3,
      isAccessible: 'Yes'
    },
    {
      place: 'Steak Saloon',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 5,
      isAccessible: 'Yes'
    },
    {
      place: 'Brasserie',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 5,
      isAccessible: 'Yes'
    },
    {
      place: 'Bistro',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 2,
      isAccessible: 'Yes'
    },
    {
      place: 'Tapas Bar',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 9,
      isAccessible: 'Yes'
    },
    {
      place: 'Italian Restaurant',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'Steakhouse',
      rating: '1 star',
      time: '9 am - 11 am',
      visits: 12,
      isAccessible: 'Yes'
    },
    {
      place: 'Seafood Restaurant',
      rating: '1 star',
      time: '8 am - 11 am',
      visits: 20,
      isAccessible: 'Yes'
    },
    {
      place: 'Indian Restaurant',
      rating: '1 star',
      time: '11 am - 1 pm',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'French Restaurant',
      rating: '1 star',
      time: '9 am - 2 pm',
      visits: 10,
      isAccessible: 'Yes'
    },
    {
      place: 'Bistro-Style Diner',
      rating: '1 star',
      time: '9 am - 3 pm',
      visits: 15,
      isAccessible: 'Yes'
    }
  ]

  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>()

  return (
    <Table
      columns={[
        { label: 'Lunch places', width: 20, key: 'place' },
        { label: 'Rating', width: 20, key: 'rating' },
        { label: 'Lunch time', width: 20, key: 'time' },
        {
          label: 'Times visited',
          width: 20,
          key: 'visits',
          isSortable: true,
          icon: <SortArrow active={Boolean(sortOrder)} />,
          sortFunction: () => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
          }
        },
        { label: 'Wheelchair accessible?', width: 20, key: 'isAccessible' }
      ]}
      footerColumns={[
        { label: 'Note that the lunch times might have changed', width: 100 }
      ]}
      pageSize={5}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page)}
      totalItems={content.length}
      content={orderBy(content, 'visits', sortOrder)}
    />
  )
}
