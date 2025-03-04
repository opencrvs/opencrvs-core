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
import { userEvent, within, expect } from '@storybook/test'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClueMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { Pages } from './index'

const meta: Meta<typeof Pages> = {
  title: 'Declare',
  beforeEach: () => {
    useEventFormData.getState().clear()
  }
}

export default meta

type Story = StoryObj<typeof Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

// Use an undeclared draft event for tests
const undeclaredDraftEvent = {
  ...tennisClueMembershipEventDocument,
  actions: tennisClueMembershipEventDocument.actions.filter(
    ({ type }) => type === 'CREATE'
  )
}

export const Page: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: undeclaredDraftEvent.id,
        pageId: 'applicant'
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return undeclaredDraftEvent
          })
        ]
      }
    }
  }
}

export const FilledPagesVisibleInReview: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Who is applying for the membership?/)

    await expect(
      await canvas.findByTestId('event-menu-toggle-button-image')
    ).toBeInTheDocument()

    await step('Fill the applicant details', async () => {
      await userEvent.type(
        await canvas.findByTestId('text__applicant____firstname'),
        'John'
      )

      await userEvent.type(
        await canvas.findByTestId('text__applicant____surname'),
        'Doe'
      )

      const continueButton = await canvas.findByText('Continue')
      await userEvent.click(continueButton)
      await userEvent.click(continueButton)
    })

    await step('Verify that filled pages are visible in review', async () => {
      const applicantFirstNameRow = await canvas.findByText(
        "Applicant's first name"
      )
      await expect(applicantFirstNameRow).toBeInTheDocument()
      const applicantFirstNameCell = applicantFirstNameRow.nextElementSibling
      await expect(applicantFirstNameCell).toHaveTextContent('John')

      const applicantSurnameRow = await canvas.findByText("Applicant's surname")
      const applicantSurnameCell = applicantSurnameRow.nextElementSibling
      await expect(applicantSurnameCell).toHaveTextContent('Doe')
    })
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: undeclaredDraftEvent.id,
        pageId: 'applicant'
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return undeclaredDraftEvent
          })
        ]
      }
    }
  }
}

export const CanSubmitValidlyFilledForm: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Who is applying for the membership?/)

    await step('Fill the applicant details', async () => {
      await userEvent.type(
        await canvas.findByTestId('text__applicant____firstname'),
        'John'
      )

      await userEvent.type(
        await canvas.findByTestId('text__applicant____surname'),
        'Doe'
      )

      await userEvent.type(await canvas.findByPlaceholderText('dd'), '11')

      await userEvent.type(await canvas.findByPlaceholderText('mm'), '11')

      await userEvent.type(await canvas.findByPlaceholderText('yyyy'), '1990')

      await userEvent.click(
        await canvas.findByText('Tennis club membership application')
      )

      await userEvent.click(await canvas.findByText('Select...'))
      await userEvent.click(await canvas.findByText('Albania'))
      await userEvent.click(await canvas.findByText('Select...'))
      await userEvent.click(await canvas.findByText('Central'))
      await userEvent.click(await canvas.findByText('Select...'))
      await userEvent.click(await canvas.findByText('Ibombo'))

      const continueButton = await canvas.findByText('Continue')
      await userEvent.click(continueButton)
    })

    // First fill in the recommenders name, but then click 'No recommender'. This should not cause validation errors on review page.
    await step('Fill the recommenders details', async () => {
      await userEvent.type(
        await canvas.findByTestId('text__recommender____firstname'),
        'John'
      )

      await userEvent.type(
        await canvas.findByTestId('text__recommender____surname'),
        'Dory'
      )

      await userEvent.click(await canvas.findByLabelText('No recommender'))

      const continueButton = await canvas.findByText('Continue')
      await userEvent.click(continueButton)
    })

    await step(
      'Verify that register button is enabled and that no validation errors are shown',
      async () => {
        await expect(
          canvas.queryByText('Required for registration')
        ).not.toBeInTheDocument()
        await expect(await canvas.findByText('Register')).toBeEnabled()
      }
    )
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: undeclaredDraftEvent.id,
        pageId: 'applicant'
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return undeclaredDraftEvent
          })
        ]
      }
    }
  }
}
