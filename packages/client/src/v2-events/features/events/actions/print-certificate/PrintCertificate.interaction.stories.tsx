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
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'

import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Outlet } from 'react-router-dom'
import {
  ActionType,
  generateEventDocument,
  generateWorkqueues,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument
} from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { CERT_TEMPLATE_ID } from '../../useCertificateTemplateSelectorFieldConfig'
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
      const requiredErrors = await canvas.findAllByText('Required')

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
        const requiredErrors = await canvas.findAllByText('Required')

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

      await expect(canvas.queryByText('Required')).not.toBeInTheDocument()
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
      const requiredErrorsAfter = await canvas.findAllByText('Required')

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

const generator = testDataGenerator()

export const RedirectAfterPrint: Story = {
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    test: {
      // Since we cannot test the generated PDF, we can ignore the failed font request
      dangerouslyIgnoreUnhandledErrors: true
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.actions.printCertificate.request.mutation(() => {
            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.DECLARE,
                ActionType.VALIDATE,
                ActionType.REGISTER,
                ActionType.PRINT_CERTIFICATE
              ]
            })
          })
        ],
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues()
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 1 }
            }, {})
          })
        ]
      }
    },
    offline: {
      events: [tennisClubMembershipEventDocument],

      drafts: [
        generator.event.draft({
          eventId: tennisClubMembershipEventDocument.id,
          actionType: ActionType.PRINT_CERTIFICATE,
          annotation: {
            [CERT_TEMPLATE_ID]: 'tennis-club-membership-certified-certificate',
            'collector.requesterId': 'INFORMANT',
            'collector.identity.verify': true,
            templateId: 'v2.tennis-club-membership-certified-certificate'
          }
        })
      ]
    },
    reactRouter: {
      router: {
        initialPath: '/',
        element: <Outlet />,
        children: [routesConfig]
      },
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
        {
          eventId: tennisClubMembershipEventDocument.id
        },
        {
          templateId: 'tennis-club-membership-certificate'
        }
      )
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Prompts confirmation on print', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Yes, print certificate' })
      )

      await canvas.findByText('Print and issue certificate?')
      await canvas.findByText(
        'A Pdf of the certificate will open in a new tab for printing and issuing.'
      )

      await canvas.findByRole('button', { name: 'Cancel' })
    })

    await step('Redirects to overview after print', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Print' })
      )

      await waitFor(
        async () => {
          await canvas.findByText('Assigned to')
          await canvas.findByText('Certificate is ready to print')
        },
        { timeout: 7000 } // Generating the PDF takes a long time.
      )
    })
  }
}
