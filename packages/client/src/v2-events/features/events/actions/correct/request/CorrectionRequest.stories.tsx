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
import { ActionType } from '@opencrvs/commons/client'
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

const meta: Meta<typeof Request.Pages> = {
  title: 'CorrectionRequest'
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

const generator = testDataGenerator()
const draft = testDataGenerator().event.draft({
  eventId: tennisClubMembershipEventDocument.id,
  actionType: ActionType.REQUEST_CORRECTION
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
      initialPath: ROUTES.V2.EVENTS.CORRECTION.REVIEW.buildPath({
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

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })
  }
}

export const Review: Story = {
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
      initialPath: ROUTES.V2.EVENTS.CORRECTION.REVIEW.buildPath({
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

      await userEvent.click(canvas.getByTestId('location__country'))
      await userEvent.type(canvas.getByTestId('location__country'), 'Far')
      await userEvent.click(canvas.getByText('Farajaland', { exact: true }))

      await userEvent.type(canvas.getByTestId('text__state'), 'My State')
      await userEvent.type(canvas.getByTestId('text__district2'), 'My District')
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    })

    await step('Go back to review', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to review' })
      )
      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeDisabled()
      })
    })

    await step("Check applicant's profile picture", async () => {
      const container = canvas.getByTestId('row-value-applicant.image')
      const buttons = within(container).getAllByRole('button', {
        name: "Applicant's profile picture"
      })
      await expect(buttons).toHaveLength(2)
      await userEvent.click(buttons[0])
      const closeButton = (await canvas.findAllByRole('button')).find(
        (btn) => btn.id === 'preview_close'
      )
      if (!closeButton) {
        throw new Error("Close button with id 'preview_close' not found")
      }
      await userEvent.click(closeButton)
    })

    await step('Change recommender values', async () => {
      await userEvent.click(canvas.getByTestId('change-button-recommender.id'))
      await userEvent.type(
        canvas.getByTestId('text__recommender____id'),
        '1234567890'
      )
    })

    await step('Go back to review', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to review' })
      )
      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeEnabled()
      })
    })
  }
}

export const Summary: Story = {
  parameters: {
    offline: {
      drafts: [draft]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <FormClear />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.CORRECTION.SUMMARY.buildPath({
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
    await step('Check the summary table', async () => {
      const button = (await canvas.findAllByRole('button')).find(
        (x) => x.innerText === "Applicant's profile picture"
      )
      await expect(button).toBeInTheDocument()

      if (!button) {
        throw new Error(
          "Button with text 'Applicant's profile picture' not found"
        )
      }
      await userEvent.click(button)
      const closeButton = (await canvas.findAllByRole('button')).find(
        (btn) => btn.id === 'preview_close'
      )
      if (!closeButton) {
        throw new Error("Close button with id 'preview_close' not found")
      }
      await userEvent.click(closeButton)
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
      initialPath: ROUTES.V2.EVENTS.CORRECTION.REVIEW.buildPath({
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

    await userEvent.click(canvas.getByRole('button', { name: /approve/i }))
    await userEvent.click(canvas.getByRole('button', { name: /cancel/i }))
    await userEvent.click(canvas.getByRole('button', { name: /reject/i }))
    await userEvent.click(canvas.getByRole('button', { name: /cancel/i }))
  }
}
