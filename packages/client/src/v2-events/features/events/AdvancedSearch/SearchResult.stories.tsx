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
import { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  eventQueryDataGenerator,
  EventStatus,
  tennisClubMembershipEvent,
  WorkqueueFixture
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { SearchResult } from './SearchResult'

const meta: Meta<typeof SearchResult> = {
  title: 'Components/SearchResult',
  component: SearchResult,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof SearchResult>

const queryData = Array.from({ length: 12 }, () => eventQueryDataGenerator())

const mockSearchParams = {
  'applicant.firstname': 'Danny',
  'applicant.dob': '1999-11-11'
}

export const DefaultSearchResult: Story = {
  name: 'Default Search Result',
  args: {
    eventConfigs: [tennisClubMembershipEvent],
    queryData: [
      eventQueryDataGenerator({
        declaration: {
          'recommender.none': true,
          'applicant.firstname': 'Danny',
          'applicant.surname': 'Doe',
          'applicant.dob': '1999-11-11'
        },
        status: EventStatus.REGISTERED
      })
    ],
    searchParams: mockSearchParams,
    columns: WorkqueueFixture[0].columns
  }
}

export const SearchResultWithMultipleItems: Story = {
  name: 'Search Results With Multiple Items',
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    eventConfigs: [tennisClubMembershipEvent],
    queryData: queryData.filter((e) => e.status === EventStatus.REGISTERED),
    searchParams: { status: EventStatus.REGISTERED },
    columns: WorkqueueFixture[0].columns
  }
}
export const NoSearchResult: Story = {
  name: 'No Search Result',
  args: {
    eventConfigs: [tennisClubMembershipEvent],
    queryData: [],
    searchParams: mockSearchParams,
    columns: WorkqueueFixture[0].columns
  }
}
