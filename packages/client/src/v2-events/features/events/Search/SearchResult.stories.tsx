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
  mandatoryColumns,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { SearchResultComponent } from './SearchResult'

const meta: Meta<typeof SearchResultComponent> = {
  title: 'Components/SearchResult',
  component: SearchResultComponent,
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

type Story = StoryObj<typeof SearchResultComponent>

const queryData = Array.from({ length: 12 }, (_, i) =>
  eventQueryDataGenerator(undefined, i)
)

export const DefaultSearchResult: Story = {
  name: 'Default Search Result',
  args: {
    eventConfigs: [tennisClubMembershipEvent],
    queryData: [
      eventQueryDataGenerator({
        declaration: {
          'recommender.none': true,
          'applicant.name': {
            firstname: 'Danny',
            surname: 'Doe'
          },
          'applicant.dob': '1999-11-11'
        },
        status: EventStatus.enum.REGISTERED
      })
    ],
    columns: mandatoryColumns
  }
}
export const SearchResultWithMultipleItems: Story = {
  name: 'Search Results With Multiple Items',
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    eventConfigs: [tennisClubMembershipEvent],
    queryData: queryData.map((e) => ({
      ...e,
      status: EventStatus.enum.REGISTERED
    })),
    columns: mandatoryColumns
  }
}
export const NoSearchResult: Story = {
  name: 'No Search Result',
  args: {
    eventConfigs: [tennisClubMembershipEvent],
    queryData: [],
    columns: mandatoryColumns
  }
}
