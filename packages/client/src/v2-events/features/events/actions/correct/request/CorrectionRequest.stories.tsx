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
import { ActionType, TestUserRole } from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventWithCorrectionRequest
} from '@client/v2-events/features/events/fixtures'
import { ROUTES } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { router } from './router'
import * as Request from './index'

const generator = testDataGenerator()

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
      initialPath: ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW.buildPath({
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

export const ReviewCorrection: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.localRegistrar
      )
      // Intermittent failures starts to happen when global state gets out of whack.
      // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW.buildPath({
        eventId: tennisClubMembershipEventWithCorrectionRequest.id
      })
    }
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', { name: 'Continue' })
      ).toBeNull()
    })

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: /approve/i })
      ).toBeInTheDocument()
    })

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: /reject/i })
      ).toBeInTheDocument()
    })

    await expect(canvas.queryByText('Add attachment')).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /approve/i }))
    await userEvent.click(canvas.getByTestId('close-dialog'))

    await userEvent.click(canvas.getByRole('button', { name: /reject/i }))
    const confirmButton = canvas.getByRole('button', { name: /confirm/i })
    await expect(confirmButton).toBeDisabled()

    const reasonInput = canvasElement.querySelector('#reject-correction-reason')
    if (reasonInput) {
      await userEvent.type(reasonInput, 'Missing legal documentation')
      await expect(confirmButton).toBeEnabled()
    }

    await userEvent.click(canvas.getByTestId('close-dialog'))
  }
}
