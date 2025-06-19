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
import { expect, fn, userEvent, waitFor, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionStatus,
  ActionType,
  Draft,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TokenUserType
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { useEventFormData } from '../../useEventFormData'
import { Pages } from './index'

const meta: Meta<typeof Pages> = {
  title: 'Declare/Interaction',
  beforeEach: () => {
    useEventFormData.setState({ formValues: {} })
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
  ...tennisClubMembershipEventDocument,
  actions: tennisClubMembershipEventDocument.actions.filter(
    ({ type }) => type === ActionType.CREATE || type === ActionType.ASSIGN
  )
}
const spy = fn()

function createDraftHandlers() {
  const draftList = fn<() => Draft[]>(() => [])
  return [
    tRPCMsw.event.draft.create.mutation((req) => {
      const response: Draft = {
        id: 'test-draft-id',
        eventId: req.eventId,
        transactionId: req.transactionId,
        createdAt: new Date().toISOString(),
        action: {
          ...req,
          declaration: req.declaration || {},
          createdBy: 'test-user',
          createdByUserType: TokenUserType.Enum.user,
          createdByRole: 'test-role',
          createdAtLocation: 'test-location',
          createdAt: new Date().toISOString(),
          status: ActionStatus.Accepted
        }
      }
      spy(req)
      draftList.mockReturnValue([response])
      return response
    }),
    tRPCMsw.event.draft.list.query(() => {
      return draftList()
    })
  ]
}

export const SaveAndExit: Story = {
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
        drafts: createDraftHandlers(),
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return [
              getCurrentEventState(
                undeclaredDraftEvent,
                tennisClubMembershipEvent
              )
            ]
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return undeclaredDraftEvent
          }),
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues()
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 7 }
            }, {})
          }),
          tRPCMsw.event.search.query((input) => {
            return [
              getCurrentEventState(
                undeclaredDraftEvent,
                tennisClubMembershipEvent
              )
            ]
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Fill the applicant details', async () => {
      const applicantFirstNameInput =
        await canvas.findByTestId('text__firstname')

      const applicantSurnameInput = await canvas.findByTestId('text__surname')

      await waitFor(async () => expect(applicantFirstNameInput).toBeEnabled())
      await waitFor(async () => expect(applicantSurnameInput).toBeEnabled())

      await userEvent.type(applicantFirstNameInput, 'Clearly')
      await userEvent.type(applicantSurnameInput, 'Draft')

      const continueButton = await canvas.findByText('Continue')
      await userEvent.click(continueButton)
    })

    await step('click `Save & Exit` button', async () => {
      const button = await canvas.findByRole('button', { name: /Save & Exit/ })
      await userEvent.click(button)
      const modal = within(await canvas.findByRole('dialog'))
      await expect(
        modal.getByRole('heading', { name: /Save & exit\?/ })
      ).toBeInTheDocument()
    })

    await step('click `Confirm` button in modal', async () => {
      const modal = within(await canvas.findByRole('dialog'))
      await userEvent.click(modal.getByRole('button', { name: /Confirm/ }))
    })

    await waitFor(async () => expect(spy).toHaveBeenCalled())
    await waitFor(async () => canvas.findByText('Clearly Draft'))

    const recordInCreatedState = canvas.queryByText(/CREATED_STATUS/)
    await expect(recordInCreatedState).not.toBeInTheDocument()
  }
}

export const DraftShownInForm: Story = {
  name: 'Form with an existing remote draft',
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: undeclaredDraftEvent.id,
        pageId: 'applicant'
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        drafts: createDraftHandlers(),
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return [
              getCurrentEventState(
                undeclaredDraftEvent,
                tennisClubMembershipEvent
              )
            ]
          }),
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues()
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 1 }
            }, {})
          }),
          tRPCMsw.event.search.query((input) => {
            return [
              getCurrentEventState(
                undeclaredDraftEvent,
                tennisClubMembershipEvent
              )
            ]
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return undeclaredDraftEvent
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Fill the applicant details', async () => {
      const applicantFirstNameInput =
        await canvas.findByTestId('text__firstname')
      const applicantSurnameInput = await canvas.findByTestId('text__surname')

      await waitFor(async () => expect(applicantFirstNameInput).toBeEnabled())
      await waitFor(async () => expect(applicantSurnameInput).toBeEnabled())

      await userEvent.type(applicantFirstNameInput, 'Clearly')
      await userEvent.type(applicantSurnameInput, 'Draft')
    })
    const continueButton = await canvas.findByText('Continue')
    await userEvent.click(continueButton)
    const button = await canvas.findByRole('button', { name: /Save & Exit/ })
    await userEvent.click(button)
    const modal = within(await canvas.findByRole('dialog'))
    await userEvent.click(await modal.findByRole('button', { name: /Confirm/ }))

    await userEvent.click(await canvas.findByText('Clearly Draft'))

    await userEvent.click(await canvas.findByRole('button', { name: /Action/ }))

    await userEvent.click(await canvas.findByText(/Declare/))
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
      const applicantFirstNameInput =
        await canvas.findByTestId('text__firstname')
      const applicantSurnameInput = await canvas.findByTestId('text__surname')

      await waitFor(async () => expect(applicantFirstNameInput).toBeEnabled())
      await waitFor(async () => expect(applicantSurnameInput).toBeEnabled())

      await userEvent.type(applicantFirstNameInput, 'John')

      await userEvent.type(applicantSurnameInput, 'Doe')

      const continueButton = await canvas.findByText('Continue')
      await userEvent.click(continueButton)
      await userEvent.click(continueButton)
    })

    await step('Verify that filled pages are visible in review', async () => {
      await canvas.findByText("Applicant's name")

      await canvas.findByText('John Doe')
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
    },
    chromatic: { disableSnapshot: true }
  }
}

export const CanSubmitValidlyFilledForm: Story = {
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

      await userEvent.click(
        await canvas.findByText('Tennis club membership application')
      )

      await userEvent.click(await canvas.findByText('Select...'))
      await userEvent.click(await canvas.findByText('Bangladesh'))
      await userEvent.click(await canvas.findByText('Select...'))
      await userEvent.click(await canvas.findByText('Central'))
      await userEvent.click(await canvas.findByText('Select...'))
      await userEvent.click(await canvas.findByText('Ibombo'))

      const continueButton = await canvas.findByText('Continue')
      await userEvent.click(continueButton)
    })

    // First fill in the recommenders name, but then click 'No recommender'. This should not cause validation errors on review page.
    await step('Fill the recommenders details', async () => {
      const recommenderFirstNameInput =
        await canvas.findByTestId('text__firstname')
      const recommenderSurnameInput = await canvas.findByTestId('text__surname')

      await waitFor(async () => expect(recommenderFirstNameInput).toBeEnabled())
      await waitFor(async () => expect(recommenderSurnameInput).toBeEnabled())

      await userEvent.type(recommenderFirstNameInput, 'John')
      await userEvent.type(recommenderSurnameInput, 'Dory')

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
    },
    chromatic: { disableSnapshot: true }
  }
}
