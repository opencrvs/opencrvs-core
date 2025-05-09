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
  tennisClubMembershipEvent,
  workqueues
} from '@opencrvs/commons/client'
import { tennisClubMembershipEvents } from '../fixtures'
import { SearchResult } from './SearchResult'

const meta: Meta<typeof SearchResult> = {
  title: 'Components/SearchResult',
  component: SearchResult,
  parameters: {
    layout: 'centered'
  }
}

const mockSearchParams = {
  'applicant.firstname': 'Danny',
  'applicant.dob': '1999-11-11'
}

export default meta
export const DefaultSearchResult: StoryObj<typeof SearchResult> = {
  name: 'Default Search Result',
  render: function Component() {
    return (
      <React.Suspense>
        <SearchResult
          eventConfig={tennisClubMembershipEvent}
          queryData={[eventQueryDataGenerator()]}
          searchParams={mockSearchParams}
          workqueueConfig={workqueues['all']}
        />
      </React.Suspense>
    )
  }
}

export const SearchResultWithMultipleItems: StoryObj<typeof SearchResult> = {
  name: 'Search Results With Multiple Items',
  render: function Component() {
    return (
      <React.Suspense>
        <SearchResult
          eventConfig={tennisClubMembershipEvent}
          queryData={tennisClubMembershipEvents.filter(
            (e) => e.status === 'REGISTERED'
          )}
          searchParams={{ status: 'REGISTERED' }}
          workqueueConfig={workqueues['all']}
        />
      </React.Suspense>
    )
  }
}

export const NoSearchResult: StoryObj<typeof SearchResult> = {
  name: 'No Search Result',
  render: function Component() {
    return (
      <React.Suspense>
        <SearchResult
          eventConfig={tennisClubMembershipEvent}
          queryData={[]}
          searchParams={mockSearchParams}
          workqueueConfig={workqueues['all']}
        />
      </React.Suspense>
    )
  }
}
