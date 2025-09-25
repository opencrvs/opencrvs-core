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
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import superjson from 'superjson'
import { expect, waitFor, within, userEvent } from '@storybook/test'
import {
  ActionStatus,
  ActionType,
  generateActionDocument,
  generateEventDocument,
  tennisClubMembershipEvent,
  TestUserRole,
  ActionDocument,
  TokenUserType,
  UUID,
  generateUuid
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { ROUTES } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { router } from './router'
import * as Request from './index'

const meta: Meta<typeof Request.Pages> = {
  title: 'CorrectionRequest',
  parameters: {
    userRole: TestUserRole.enum.REGISTRATION_AGENT
  }
}

export default meta

type Story = StoryObj<typeof Request.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const draft = testDataGenerator().event.draft({
  eventId: tennisClubMembershipEventDocument.id,
  actionType: ActionType.REQUEST_CORRECTION,
  annotation: undefined,
  omitFields: ['applicant.image']
})

function FormClear() {
  const drafts = useDrafts()
  useEffect(() => {
    drafts.setLocalDraft(draft)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Outlet />
}

export const ReviewWithChanges: Story = {
  parameters: {
    offline: {
      drafts: [draft]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.queryByText('Add attachment')).not.toBeInTheDocument()
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })
  }
}

export const ReviewWithParentFieldChanges: Story = {
  parameters: {
    offline: {
      drafts: [draft]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })

    await step('Change applicant values', async () => {
      await userEvent.click(
        canvas.getByTestId('change-button-applicant.address')
      )

      // make senior-pass page available meeting conditional with applicant dob
      await userEvent.clear(canvas.getByTestId('applicant____dob-dd'))
      await userEvent.type(canvas.getByTestId('applicant____dob-dd'), '10')
      await userEvent.clear(canvas.getByTestId('applicant____dob-mm'))
      await userEvent.type(canvas.getByTestId('applicant____dob-mm'), '10')
      await userEvent.clear(canvas.getByTestId('applicant____dob-yyyy'))
      await userEvent.type(canvas.getByTestId('applicant____dob-yyyy'), '1945')

      await userEvent.click(canvas.getByTestId('location__country'))
      await userEvent.type(canvas.getByTestId('location__country'), 'Far')
      await userEvent.click(canvas.getByText('Farajaland', { exact: true }))

      await userEvent.type(canvas.getByTestId('text__state'), 'My State')
      await userEvent.type(canvas.getByTestId('text__district2'), 'My District')
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    })

    await step('Change senior pass values', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to review' })
      )
      await userEvent.click(canvas.getByTestId('change-button-senior-pass.id'))
      await userEvent.type(
        canvas.getByTestId('text__senior-pass____id'),
        '123456'
      )

      await waitFor(async () =>
        expect(
          canvas.getByRole('checkbox', {
            name: 'Does recommender have senior pass?'
          })
        ).toBeInTheDocument()
      )

      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    })

    await step('Select recommender none option', async () => {
      await userEvent.click(
        canvas.getByRole('checkbox', {
          name: 'No recommender'
        })
      )
      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to review' })
      )
    })

    await step('Check senior pass box', async () => {
      await userEvent.click(canvas.getByTestId('change-button-senior-pass.id'))

      await waitFor(async () =>
        expect(
          canvas.getByRole('checkbox', {
            name: 'Does recommender have senior pass?'
          })
        ).toBeInTheDocument()
      )

      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    })

    await step('Re-select recommender none option', async () => {
      await waitFor(async () =>
        expect(
          canvas.getByRole('checkbox', {
            name: 'No recommender'
          })
        ).toBeInTheDocument()
      )
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
      await expect(canvas.queryByText('Add attachment')).not.toBeInTheDocument()

      await expect(canvas.queryByText('Add attachment')).not.toBeInTheDocument()
    })

    await step('Change recommender values', async () => {
      await userEvent.click(
        canvas.getByTestId('change-button-recommender.none')
      )
      await userEvent.click(
        canvas.getByRole('checkbox', {
          name: 'No recommender'
        })
      )

      await userEvent.type(
        canvas.getByTestId('text__recommender____id'),
        '1234567890'
      )
    })

    await step('Go back to review', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to review' })
      )
    })

    await step('Re-check senior pass box', async () => {
      await userEvent.click(canvas.getByTestId('change-button-senior-pass.id'))
      await userEvent.click(
        canvas.getByRole('checkbox', {
          name: 'Does recommender have senior pass?'
        })
      )

      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to review' })
      )
    })

    await step('Continue button is enabled', async () => {
      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeEnabled()
      })

      await userEvent.click(canvas.getByTestId('exit-button'))
    })
  }
}

export const Summary: Story = {
  parameters: {
    offline: {
      drafts: [draft],
      events: [tennisClubMembershipEventDocument]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <FormClear />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Check the summary table', async () => {
      void expect(await canvas.findByText('Verify ID')).toBeInTheDocument()
      void expect(canvas.getAllByText(/^Yes$/)).toHaveLength(1)
      void expect(
        await canvas.findByText('Another registration agent or field agent')
      ).toBeInTheDocument()
      void expect(
        await canvas.findByText("Child's name was incorrect")
      ).toBeInTheDocument()
      void expect(await canvas.findByText('Riku Rouvila')).toBeInTheDocument()
      void expect(await canvas.findByText('Max McLaren')).toBeInTheDocument()
    })
  }
}

const event1 = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    ActionType.CREATE,
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ],
  declarationOverrides: {
    'applicant.dobUnknown': false,
    'applicant.age': 20,
    'applicant.dob': '2000-01-01'
  }
})

export const SummaryWithPartialUpdates: Story = {
  parameters: {
    offline: {
      drafts: [draft],
      events: [event1]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <FormClear />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
        eventId: event1.id
      })
    }
  }
}

const event2 = {
  trackingId: generateUuid(),
  type: tennisClubMembershipEvent.id,
  id: generateUuid(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  actions: [
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE
    }),
    {
      type: ActionType.DECLARE,
      createdAt: new Date(Date.now() - 500).toISOString(),
      createdBy: generateUuid(),
      createdByUserType: TokenUserType.Enum.user,
      createdByRole: TestUserRole.Enum.FIELD_AGENT,
      id: generateUuid(),
      createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
      declaration: {
        'applicant.name': {
          firstname: 'Riku',
          surname: 'Rouvila'
        },
        'applicant.dob': '2025-01-23',
        'applicant.address': {
          country: 'FAR',
          addressType: 'DOMESTIC',
          province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
          district: '27160bbd-32d1-4625-812f-860226bfb92a',
          urbanOrRural: 'URBAN',
          town: 'Example Town',
          residentialArea: 'Example Residential Area',
          street: 'Example Street',
          number: '55',
          zipCode: '123456'
        },
        'recommender.name': {
          firstname: 'Euan',
          surname: 'Millar'
        },
        'recommender.id': '123456789'
      },
      annotation: {},
      status: ActionStatus.Accepted,
      transactionId: generateUuid()
    } satisfies ActionDocument,
    {
      type: ActionType.VALIDATE,
      createdAt: new Date(Date.now() - 500).toISOString(),
      createdBy: generateUuid(),
      createdByUserType: TokenUserType.Enum.user,
      createdByRole: TestUserRole.Enum.FIELD_AGENT,
      id: generateUuid(),
      createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
      declaration: {},
      annotation: {},
      status: ActionStatus.Accepted,
      transactionId: generateUuid()
    },
    {
      type: ActionType.REGISTER,
      createdAt: new Date(Date.now() - 500).toISOString(),
      createdBy: generateUuid(),
      createdByUserType: TokenUserType.Enum.user,
      createdByRole: TestUserRole.Enum.FIELD_AGENT,
      id: generateUuid(),
      createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
      declaration: {},
      annotation: {},
      status: ActionStatus.Accepted,
      transactionId: generateUuid()
    }
  ]
}

export const SummaryWithPartialUpdates2: Story = {
  parameters: {
    offline: {
      drafts: [],
      events: [event2]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <FormClear />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
        eventId: event2.id
      })
    }
  }
}
