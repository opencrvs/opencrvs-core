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
import { expect, waitFor, within } from '@storybook/test'
import { ActionType, tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { tennisClubMembershipEventWithCorrectionRequest } from '@client/v2-events/features/events/fixtures'
import { ROUTES } from '@client/v2-events/routes'
import { router } from '@client/v2-events/features/events/actions/correct/review/router'
import { Review as CorrectionReview } from '@client/v2-events/features/events/actions/correct/review'

const generator = testDataGenerator()

const meta: Meta<typeof CorrectionReview> = {
  title: 'ActionMenu/CoreActionConfig/ApproveRejectCorrection'
}

export default meta

type Story = StoryObj<typeof CorrectionReview>

/**
 * A country config for APPROVE_CORRECTION and REJECT_CORRECTION, overriding
 * the hardcoded default label/icon (`buttonMessages.approve`/`reject` and
 * `Check`/`X` in ReviewCorrection.tsx) to prove both buttons read from
 * ActionConfig when present.
 */
const configuration = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.APPROVE_CORRECTION,
      label: {
        id: 'storybook.action.approve-correction.custom-label',
        defaultMessage: 'Uphold correction',
        description:
          'Country-configured label for the approve-correction action'
      },
      icon: 'CircleWavyCheck',
      flags: []
    },
    {
      type: ActionType.REJECT_CORRECTION,
      label: {
        id: 'storybook.action.reject-correction.custom-label',
        defaultMessage: 'Decline correction',
        description: 'Country-configured label for the reject-correction action'
      },
      icon: 'WarningCircle',
      flags: []
    }
  ]
}

export const approveRejectCorrectionLabelsAreConfigurable: Story = {
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
    // Snapshot enabled here to visually verify the configured icon.
    chromatic: { disableSnapshot: false },
    // `.storybook/preview.tsx`'s global loader seeds the query cache directly
    // (bypassing MSW) with a default config unless `offline.configs` is set
    // here, so mocking `event.config.get` via MSW alone is not enough.
    offline: {
      configs: [configuration],
      events: [tennisClubMembershipEventWithCorrectionRequest]
    },
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
        canvas.getByRole('button', { name: /Uphold correction/i })
      ).toBeInTheDocument()
    })

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: /Decline correction/i })
      ).toBeInTheDocument()
    })

    await expect(
      canvas.queryByRole('button', { name: /^Approve$/i })
    ).not.toBeInTheDocument()
    await expect(
      canvas.queryByRole('button', { name: /^Reject$/i })
    ).not.toBeInTheDocument()

    const approveButton = canvas.getByRole('button', {
      name: /Uphold correction/i
    })
    const rejectButton = canvas.getByRole('button', {
      name: /Decline correction/i
    })

    // Icon identity can't be asserted from the DOM (phosphor-react renders
    // plain <svg> geometry with no name-identifying attribute) — just confirm
    // one rendered alongside each configured label.
    await expect(approveButton.querySelector('svg')).toBeInTheDocument()
    await expect(rejectButton.querySelector('svg')).toBeInTheDocument()
  }
}
