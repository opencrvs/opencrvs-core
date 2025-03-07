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
import { tennisClubMembershipEvent, workqueues } from '@opencrvs/commons/client'
import { SearchResult } from './SearchResult'

const meta: Meta<typeof SearchResult> = {
  title: 'Components/SearchResult',
  component: SearchResult,
  parameters: {
    layout: 'centered'
  }
}

const mockSearchParams = {
  'applicant.dob': '1999-11-11'
}

const mockQueryData = [
  {
    id: 'ffd8a958-f52f-4e31-b4b9-c2dddb87b165',
    type: 'tennis-club-membership',
    status: 'REGISTERED' as const,
    createdAt: '2025-03-07T06:49:39.932Z',
    createdBy: '67c038638a9f2e03f5de69f9',
    createdAtLocation: 'cd36c0c3-c1af-4cc9-9152-8ecc9f2d4538',
    modifiedAt: '2025-03-07T06:50:17.123Z',
    assignedTo: null,
    updatedBy: '67c038638a9f2e03f5de69f9',
    data: {
      'recommender.none': true,
      'applicant.firstname': 'Danny',
      'applicant.surname': 'Doe',
      'applicant.dob': '1999-11-11'
    },
    trackingId: 'M3F8YQ'
  }
]

export default meta

export const DefaultSearchResult: StoryObj<typeof SearchResult> = {
  name: 'Default Search Result',
  render: function Component(args) {
    return (
      <React.Suspense>
        <SearchResult
          currentEvent={tennisClubMembershipEvent}
          queryData={mockQueryData}
          searchParams={mockSearchParams}
          workqueueConfig={workqueues['all']}
        />
      </React.Suspense>
    )
  }
}
