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
  Draft,
  getCurrentEventState,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClueMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { Pages } from './index'

const meta: Meta<typeof Pages> = {
  title: 'Declare'
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
const spy = fn()
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
            return [getCurrentEventState(undeclaredDraftEvent)]
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
      await userEvent.type(
        await canvas.findByTestId('text__applicant____firstname'),
        'Clearly'
      )

      await userEvent.type(
        await canvas.findByTestId('text__applicant____surname'),
        'Draft'
      )
    })
    const continueButton = await canvas.findByText('Continue')
    await userEvent.click(continueButton)
    const button = await canvas.findByRole('button', { name: /Save & Exit/ })
    await userEvent.click(button)
    await waitFor(async () => expect(spy).toHaveBeenCalled())
    await canvas.findByText('Clearly Draft')
    const recordInCreatedState = canvas.queryByText(/CREATED_STATUS/)
    await expect(recordInCreatedState).not.toBeInTheDocument()
  }
}

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
          createdBy: 'test-user',
          createdAtLocation: 'test-location',
          createdAt: new Date().toISOString()
        }
      }
      spy()
      draftList.mockReturnValue([response])
      return response
    }),
    tRPCMsw.event.draft.list.query(() => {
      return draftList()
    })
  ]
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
    msw: {
      handlers: {
        drafts: createDraftHandlers(),
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return [getCurrentEventState(undeclaredDraftEvent)]
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
      await userEvent.type(
        await canvas.findByTestId('text__applicant____firstname'),
        'Clearly'
      )

      await userEvent.type(
        await canvas.findByTestId('text__applicant____surname'),
        'Draft'
      )
    })
    const continueButton = await canvas.findByText('Continue')
    await userEvent.click(continueButton)
    const button = await canvas.findByRole('button', { name: /Save & Exit/ })
    await userEvent.click(button)
    await userEvent.click(await canvas.findByText('Clearly Draft'))
    await userEvent.click(await canvas.findByRole('button', { name: /Action/ }))
    await userEvent.click(await canvas.findByText(/Send an application/))

    await expect(
      await canvas.findByTestId('text__applicant____surname')
    ).toHaveValue('Draft')
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
