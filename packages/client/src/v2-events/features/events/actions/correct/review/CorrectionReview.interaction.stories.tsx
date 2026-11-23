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
import React from 'react'
import { Outlet } from 'react-router-dom'

import { expect, waitFor, within, userEvent } from '@storybook/test'
import {
  ActionType,
  EventDocument,
  generateActionDocument,
  generateTrackingId,
  TENNIS_CLUB_MEMBERSHIP,
  tennisClubMembershipEvent,
  TestUserRole,
  UUID
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { tennisClubMembershipEventWithCorrectionRequest } from '@client/v2-events/features/events/fixtures'
import { ROUTES } from '@client/v2-events/routes'
import { router } from './router'
import { Review as CorrectionReview } from './index'

const generator = testDataGenerator()

const meta: Meta<typeof CorrectionReview> = {
  title: 'CorrectionReview/Interaction',
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR
  }
}

export default meta

type Story = StoryObj<typeof CorrectionReview>

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
    chromatic: { disableSnapshot: true },
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

export const RejectCorrectionModal: Story = {
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
    chromatic: { disableSnapshot: true },
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
    await userEvent.click(canvas.getByRole('button', { name: /cancel/i }))

    await userEvent.click(canvas.getByRole('button', { name: /reject/i }))
    const confirmButton = canvas.getByRole('button', { name: /confirm/i })

    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await expect(cancelButton).toBeEnabled()
    await expect(confirmButton).toBeDisabled()

    const reasonInput = canvasElement.querySelector('#reject-correction-reason')

    if (reasonInput) {
      await userEvent.type(reasonInput, 'Missing legal documentation')
      await expect(confirmButton).toBeEnabled()
    }

    await userEvent.click(canvas.getByTestId('close-dialog'))
  }
}

// Regression test for #12636: reviewing a correction request must not crash
// when the most recent write action is something other than REQUEST_CORRECTION
// (e.g. a custom action recorded after the correction was requested).

const correctionEventId = 'b1d2e3f4-5678-4abc-9def-0123456789ab' as UUID

const actionDefaults = {
  createdBy: generator.user.id.localRegistrar,
  createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
  createdAtLocation: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

const tennisClubMembershipEventWithCorrectionRequestThenCustomAction: EventDocument =
  {
    type: TENNIS_CLUB_MEMBERSHIP,
    id: correctionEventId,
    trackingId: generateTrackingId(() => 0.1),
    createdAt: '2025-01-23T05:30:00.000Z',
    updatedAt: '2025-01-24T05:35:27.689Z',
    actions: [
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.CREATE,
        defaults: { ...actionDefaults, createdAt: '2025-01-23T05:30:00.000Z' }
      }),
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.DECLARE,
        defaults: { ...actionDefaults, createdAt: '2025-01-23T05:31:00.000Z' },
        declarationOverrides: {
          'applicant.name': { firstname: 'Riku', surname: 'Rouvila' },
          'applicant.dob': '2025-01-23',
          'recommender.name': { firstname: 'Euan', surname: 'Millar' }
        }
      }),
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.REGISTER,
        defaults: { ...actionDefaults, createdAt: '2025-01-23T05:32:00.000Z' }
      }),
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.REQUEST_CORRECTION,
        defaults: { ...actionDefaults, createdAt: '2025-01-23T05:33:00.000Z' },
        declarationOverrides: {
          'applicant.name': { firstname: 'Corrected', surname: 'Name' }
        }
      }),
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.CUSTOM,
        defaults: { ...actionDefaults, createdAt: '2025-01-24T05:35:27.689Z' }
      })
    ]
  }

export const OtherActionsCanBeAddedAfterCorrectionRequest: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.localRegistrar
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
    offline: {
      events: [tennisClubMembershipEventWithCorrectionRequestThenCustomAction]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW.buildPath({
        eventId: correctionEventId
      })
    }
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

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
  }
}

export const ApproveCorrectionModal: Story = {
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
    chromatic: { disableSnapshot: true },
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

    await userEvent.click(canvas.getByRole('button', { name: /reject/i }))
    await userEvent.click(canvas.getByRole('button', { name: /cancel/i }))

    await userEvent.click(canvas.getByRole('button', { name: /approve/i }))
    const confirmButton = canvas.getByRole('button', { name: /confirm/i })

    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await expect(cancelButton).toBeEnabled()
    await expect(confirmButton).toBeEnabled()

    await userEvent.click(canvas.getByTestId('close-dialog'))
  }
}
