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
import { expect, userEvent, waitFor, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { ActionType } from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { localDraftStore } from '@client/v2-events/features/drafts/useDrafts'
import { useEventFormData } from '../../useEventFormData'
import { useActionAnnotation } from '../../useActionAnnotation'
import { Pages } from './index'

// Use an undeclared draft event for tests
const undeclaredDraftEvent = {
  ...tennisClubMembershipEventDocument,
  actions: tennisClubMembershipEventDocument.actions.filter(
    ({ type }) => type === ActionType.CREATE || type === ActionType.ASSIGN
  )
}

const meta: Meta<typeof Pages> = {
  title: 'Declare/Interaction/ClearForm',
  parameters: {
    offline: {
      events: [undeclaredDraftEvent]
    }
  },
  beforeEach: () => {
    useEventFormData.setState({ formValues: {} })
    useActionAnnotation.setState({})
    localDraftStore.getState().setDraft(null)
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

export const ClearFormPage: Story = {
  name: 'Clear button resets all fields on the page',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Who is applying for the membership?/)

    await step('Fill the applicant details', async () => {
      const applicantFirstNameInput =
        await canvas.findByTestId('text__firstname')
      const applicantSurnameInput = await canvas.findByTestId('text__surname')

      await waitFor(async () => expect(applicantFirstNameInput).toBeEnabled())
      await waitFor(async () => expect(applicantSurnameInput).toBeEnabled())

      await userEvent.type(applicantFirstNameInput, 'John')
      await userEvent.type(applicantSurnameInput, 'Doe')

      await userEvent.type(await canvas.findByPlaceholderText('dd'), '11')
      await userEvent.type(await canvas.findByPlaceholderText('mm'), '11')
      await userEvent.type(await canvas.findByPlaceholderText('yyyy'), '1990')
    })

    await step('Cancelling the confirmation keeps the values', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Clear' })
      )

      const modal = within(await canvas.findByRole('dialog'))
      await expect(
        modal.getByRole('heading', { name: /Clear form\?/ })
      ).toBeInTheDocument()
      await userEvent.click(modal.getByRole('button', { name: /Cancel/ }))

      await expect(await canvas.findByTestId('text__firstname')).toHaveValue(
        'John'
      )
      await expect(await canvas.findByTestId('text__surname')).toHaveValue(
        'Doe'
      )
    })

    await step('Confirming clears all fields on the page', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Clear' })
      )

      const modal = within(await canvas.findByRole('dialog'))
      await userEvent.click(modal.getByRole('button', { name: 'Clear' }))

      await expect(await canvas.findByTestId('text__firstname')).toHaveValue('')
      await expect(await canvas.findByTestId('text__surname')).toHaveValue('')
      await expect(await canvas.findByPlaceholderText('dd')).toHaveValue(null)
      await expect(await canvas.findByPlaceholderText('mm')).toHaveValue(null)
      await expect(await canvas.findByPlaceholderText('yyyy')).toHaveValue(null)

      // Clearing must not flash validation errors on the cleared fields
      await expect(canvas.queryByText('Required')).not.toBeInTheDocument()
    })

    await step(
      'Clear button is not shown on pages without the configuration flag',
      async () => {
        await userEvent.click(await canvas.findByText('Continue'))

        await canvas.findByText(/Who is recommending the applicant\?/)
        await expect(
          canvas.queryByRole('button', { name: 'Clear' })
        ).not.toBeInTheDocument()
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
          }),
          tRPCMsw.event.search.query(() => {
            return { results: [], total: 0 }
          })
        ]
      }
    },
    chromatic: { disableSnapshot: true }
  }
}
