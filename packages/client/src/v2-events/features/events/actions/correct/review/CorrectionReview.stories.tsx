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
import { TestUserRole } from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { tennisClubMembershipEventWithCorrectionRequest } from '@client/v2-events/features/events/fixtures'
import { ROUTES } from '@client/v2-events/routes'
import { router } from './router'
import { Review as CorrectionReview } from './index'

const generator = testDataGenerator()

const meta: Meta<typeof CorrectionReview> = {
  title: 'CorrectionReview',
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
