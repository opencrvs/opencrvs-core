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
  eventQueryDataGenerator,
  generateWorkqueues
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument
} from '@client/v2-events/features/events/fixtures'
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
  { length: 15 },
  (_, i) => eventQueryDataGenerator(undefined, i * 52) // quite literally a magic number. It gives a sample where the test workqueues are not empty
)

export const SortWorkqueue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          }),
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryData.length }
            }, {})
          }),
          tRPCMsw.event.search.query((input) => {
            return queryData
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const TitleHeader = await canvas.findByText('Title')
    await userEvent.click(TitleHeader)
    const names = queryData.map(
      ({ declaration }) =>
        `${declaration['applicant.firstname']} ${declaration['applicant.surname']}`
    )
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b))

    await step('Sort by name - page 1', async () => {
      const namesInFirstPage = sortedNames.slice(0, 10)
      const rows = canvasElement.querySelectorAll('div[id^="row_"]')
      const nameCells = Array.from(rows).map(
        (row: Element) => row.firstElementChild?.textContent
      )
      await expect(nameCells).toStrictEqual(namesInFirstPage)
    })

    await step('Sort by name - page 2', async () => {
      const nextPageButton = await canvas.findByRole('button', {
        name: 'Next page'
      })

      const nameInSecondPage = sortedNames.slice(10)
      await userEvent.click(nextPageButton)
      const rows = canvasElement.querySelectorAll('div[id^="row_"]')
      const nameCells = Array.from(rows).map(
        (row: Element) => row.firstElementChild?.textContent
      )
      await expect(nameCells).toStrictEqual(nameInSecondPage)
    })
  }
}
