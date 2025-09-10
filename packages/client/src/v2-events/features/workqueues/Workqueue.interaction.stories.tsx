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

import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { userEvent, within, expect } from '@storybook/test'
import {
  EventIndex,
  eventQueryDataGenerator,
  EventStatus,
  generateWorkqueues,
  InherentFlags,
  NameFieldValue
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument
} from '@client/v2-events/features/events/fixtures'
import { formattedDuration } from '@client/utils/date-formatting'
import { Name } from '../events/registered-fields'
import { WorkqueueIndex } from './index'

const meta: Meta<typeof WorkqueueIndex> = {
  title: 'Workqueue/Interaction',
  component: WorkqueueIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof WorkqueueIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const queryData = Array.from(
  { length: 10 },
  (_, i) => eventQueryDataGenerator(undefined, i * 52) // quite literally a magic number. It gives a sample where the test workqueues are not empty
)

export const SortWorkqueue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryData.length }
            }, {})
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.search.query((input) => {
            return {
              results: queryData.slice(input.offset, input.limit),
              total: queryData.length + 5
            }
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const TitleHeader = await canvas.findByText('Title', {}, { timeout: 5000 })
    const LastUpdatedHeader = await canvas.findByText('Last updated')

    await userEvent.click(TitleHeader)
    const names = queryData.map(({ declaration }) =>
      declaration['applicant.name']
        ? Name.stringify(declaration['applicant.name'] as NameFieldValue)
        : ''
    )
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b))
    const reverseSortedNames = [...sortedNames].reverse()

    const lastUpdatedAt = queryData.map(({ updatedAt }) => updatedAt)
    const sortedUpdatedAt = lastUpdatedAt.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )

    const formattedUpdatedAt = sortedUpdatedAt.map((date) =>
      formattedDuration(new Date(date))
    )

    const reverseFormattedUpdatedAt = sortedUpdatedAt
      .reverse()
      .map((date) => formattedDuration(new Date(date)))

    await step('Sort by name - page 1', async () => {
      const namesInFirstPage = sortedNames.slice(0, 10)
      const rows = canvasElement.querySelectorAll('div[id^="row_"]')
      const nameCells = Array.from(rows).map(
        (row: Element) => row.firstElementChild?.textContent
      )
      await expect(nameCells).toStrictEqual(namesInFirstPage)
    })

    await step('Sort by name - page 1 - reverse', async () => {
      await userEvent.click(TitleHeader)
      const namesInFirstPage = reverseSortedNames.slice(0, 10)
      const rows = canvasElement.querySelectorAll('div[id^="row_"]')
      const nameCells = Array.from(rows).map(
        (row: Element) => row.firstElementChild?.textContent
      )
      await expect(nameCells).toStrictEqual(namesInFirstPage)
    })

    await step('Sort by last updated - page 1', async () => {
      await userEvent.click(LastUpdatedHeader)

      const updatedAtInFirstPage = formattedUpdatedAt.slice(0, 10)
      const cells = canvasElement.querySelectorAll('div[id^="row_"]')
      const updatedAtCell = Array.from(cells).map(
        (cell: Element) => cell.children[3].textContent
      )
      await expect(updatedAtCell).toStrictEqual(updatedAtInFirstPage)
    })

    await step('Sort by last updated - page 1 - reverse', async () => {
      await userEvent.click(LastUpdatedHeader)

      const updatedAtInFirstPage = reverseFormattedUpdatedAt.slice(0, 10)
      const cells = canvasElement.querySelectorAll('div[id^="row_"]')
      const updatedAtCell = Array.from(cells).map(
        (cell: Element) => cell.children[3].textContent
      )
      await expect(updatedAtCell).toStrictEqual(updatedAtInFirstPage)
    })

    await step('Sort by name - page 2', async () => {
      const nextPageButton = await canvas.findByRole('button', {
        name: 'Next page'
      })
      await userEvent.click(nextPageButton)

      await userEvent.click(TitleHeader)

      const namesInSecondPage = sortedNames.slice(10)
      const rows = canvasElement.querySelectorAll('div[id^="row_"]')
      const nameCells = Array.from(rows).map(
        (row: Element) => row.firstElementChild?.textContent
      )
      await expect(nameCells).toStrictEqual(namesInSecondPage)
    })

    await step('Sort by name - page 2 - reverse', async () => {
      await userEvent.click(TitleHeader)

      const namesInSecondPage = reverseSortedNames.slice(10)
      const rows = canvasElement.querySelectorAll('div[id^="row_"]')
      const nameCells = Array.from(rows).map(
        (row: Element) => row.firstElementChild?.textContent
      )
      await expect(nameCells).toStrictEqual(namesInSecondPage)
    })

    await step('Sort by last updated - page 2', async () => {
      await userEvent.click(LastUpdatedHeader)

      const updatedAtInFirstPage = formattedUpdatedAt.slice(10)
      const cells = canvasElement.querySelectorAll('div[id^="row_"]')
      const updatedAtCell = Array.from(cells).map(
        (cell: Element) => cell.children[3].textContent
      )
      await expect(updatedAtCell).toStrictEqual(updatedAtInFirstPage)
    })

    await step('Sort by last updated - page 2 - reverse', async () => {
      await userEvent.click(LastUpdatedHeader)

      const updatedAtInFirstPage = reverseFormattedUpdatedAt.slice(10)
      const cells = canvasElement.querySelectorAll('div[id^="row_"]')
      const updatedAtCell = Array.from(cells).map(
        (cell: Element) => cell.children[3].textContent
      )
      await expect(updatedAtCell).toStrictEqual(updatedAtInFirstPage)
    })
  }
}

const eventsWithDifferentStatuses = EventStatus.options.map((status, i) =>
  eventQueryDataGenerator(
    {
      status,
      declaration: {
        'recommender.none': true,
        'applicant.name': {
          firstname: status,
          surname: i.toString()
        },
        'applicant.dob': '2000-01-01'
      }
    },
    i * 123
  )
) satisfies EventIndex[]

export const WorkqueueCtaByStatus: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryData.length }
            }, {})
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.search.query(() => {
            return {
              total: eventsWithDifferentStatuses.length,
              results: eventsWithDifferentStatuses
            }
          })
        ]
      }
    }
  }
}

const rejectedEventsWithDifferentStatuses = eventsWithDifferentStatuses.map(
  (event) => ({
    ...event,
    flags: [InherentFlags.REJECTED]
  })
)

export const WorkqueueCtaByStatusRejected: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryData.length }
            }, {})
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.search.query(() => {
            return {
              total: rejectedEventsWithDifferentStatuses.length,
              results: rejectedEventsWithDifferentStatuses
            }
          })
        ]
      }
    }
  }
}
