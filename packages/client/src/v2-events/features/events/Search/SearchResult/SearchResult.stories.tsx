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
import { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { expect, within } from 'storybook/test'
import {
  eventQueryDataGenerator,
  EventStatus,
  mandatoryColumns,
  WorkqueueActionType
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { SearchResultComponent } from './SearchResult'

const meta: Meta<typeof SearchResultComponent> = {
  title: 'Components/SearchResult',
  component: withSuspense(SearchResultComponent),
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
    action: { type: WorkqueueActionType.enum.READ },
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
    queryData: [],
    columns: mandatoryColumns
  }
}

export const RecordOfUnknownConfigVersion: Story = {
  name: 'Record Of An Unknown Configuration Version',
  args: {
    action: { type: WorkqueueActionType.enum.READ },
    queryData: [
      {
        ...queryData[0],
        status: EventStatus.enum.REGISTERED
      },
      {
        ...queryData[1],
        status: EventStatus.enum.REGISTERED,
        configVersionId: 'removed-version'
      },
      {
        ...queryData[2],
        status: EventStatus.enum.REGISTERED
      }
    ],
    columns: mandatoryColumns
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('The record of an unknown version shows a message', async () => {
      await expect(
        await canvas.findByText(`${queryData[1].trackingId} cannot be shown`)
      ).toBeVisible()
    })

    await step('Only that record shows the message', async () => {
      await expect(
        canvas.getAllByTestId(/^unknown-config-version-/)
      ).toHaveLength(1)
    })
  }
}
