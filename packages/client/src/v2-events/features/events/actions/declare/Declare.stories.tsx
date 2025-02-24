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
import { userEvent, within } from '@storybook/test'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClueMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { Pages } from './index'
import { expect } from '@storybook/test'

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

export const Page: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: tennisClueMembershipEventDocument.id,
        pageId: 'applicant'
      })
    }
  }
}

export const Review: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: tennisClueMembershipEventDocument.id
      })
    }
  }
}

export const FilledPagesVisibleInReview: Story = {
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
        eventId: tennisClueMembershipEventDocument.id,
        pageId: 'applicant'
      })
    }
  }
}
