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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'

import { within, userEvent, expect } from '@storybook/test'
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument
} from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import * as PrintCertificate from './index'

const meta: Meta<typeof PrintCertificate.Review> = {
  title: 'Print Certificate/Interaction'
}

export default meta

type Story = StoryObj<typeof PrintCertificate.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const ContinuingAndGoingBack: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: tennisClubMembershipEventDocument.id,
        pageId: 'collector'
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Try continuing without filling the form', async () => {
      await expect(
        await canvas.findByText('Print certified copy')
      ).toBeInTheDocument()

      const continueButton = await canvas.findByRole('button', {
        name: 'Continue'
      })
      await userEvent.click(continueButton)
      const requiredErrors = await canvas.findAllByText(
        'Required for registration'
      )

      await expect(requiredErrors.length).toBe(2)
    })

    await step(
      'Fill in the Certification Type and try continuing',
      async () => {
        await userEvent.click(
          await canvas.findByTestId('select__certificateTemplateId')
        )

        await userEvent.click(
          await canvas.findByText(
            'Tennis Club Membership Certificate certified copy'
          )
        )

        const continueButton = await canvas.findByRole('button', {
          name: 'Continue'
        })
        await userEvent.click(continueButton)
        const requiredErrors = await canvas.findAllByText(
          'Required for registration'
        )

        await expect(requiredErrors.length).toBe(1)
      }
    )

    await step(
      "Fill in the Requester details and successfully continue to 'Verify their identity' page",
      async () => {
        await userEvent.click(
          await canvas.findByTestId('select__collector____requesterId')
        )

        await userEvent.click(
          await canvas.findByText('Print and issue Informant')
        )

        const continueButton = await canvas.findByRole('button', {
          name: 'Continue'
        })

        await userEvent.click(continueButton)

        await expect(
          canvas.getByText('Verify their identity')
        ).toBeInTheDocument()
      }
    )

    await step('Go back to the previous page', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'Back' }))

      await expect(
        canvas.queryByText('Required for registration')
      ).not.toBeInTheDocument()
    })

    await step('Fill in other requester details and continue', async () => {
      await userEvent.click(
        await canvas.findByTestId('select__collector____requesterId')
      )

      await userEvent.click(
        await canvas.findByText('Print and issue someone else')
      )

      const continueButton = await canvas.findByRole('button', {
        name: 'Continue'
      })

      await userEvent.click(continueButton)
      const requiredErrorsAfter = await canvas.findAllByText(
        'Required for registration'
      )

      await expect(requiredErrorsAfter.length).toBe(4)

      await userEvent.click(
        await canvas.findByTestId('select__collector____OTHER____idType')
      )

      await userEvent.click(await canvas.findByText('No ID'))

      await userEvent.type(
        await canvas.findByTestId('text__collector____OTHER____firstName'),
        'Nomen'
      )

      await userEvent.type(
        await canvas.findByTestId('text__collector____OTHER____lastName'),
        'Est Omen'
      )

      await userEvent.type(
        await canvas.findByTestId(
          'text__collector____OTHER____relationshipToMember'
        ),
        'Best friend'
      )

      await userEvent.click(continueButton)
      await expect(
        await canvas.findByRole('button', { name: 'Yes, print certificate' })
      ).toBeInTheDocument()
    })
  }
}
