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
import { waitFor, within, userEvent, expect } from '@storybook/test'
import { Onboarding as OnboardingIndex } from '@client/v2-events/features/events/actions/correct/request/index'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'

const generator = testDataGenerator()

const meta: Meta<typeof Onboarding> = {
  title: 'CorrectionRequest',
  loaders: [
    () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof OnboardingIndex>

export const Onboarding: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath({
        eventId: tennisClubMembershipEventDocument.id,
        pageId: 'corrector'
      })
    }
  },

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Continue' })
      ).toBeEnabled()
    })

    await step('Continue through correction form', async () => {
      await userEvent.click(canvas.getByText('Continue', { exact: true }))
      await userEvent.click(canvas.getByText('Verified', { exact: true }))
      await userEvent.click(canvas.getByText('Continue', { exact: true }))
      await userEvent.click(canvas.getByTestId('crcl-btn'))
      await expect(
        await canvas.findByTestId('navigation_workqueue_outbox')
      ).toBeInTheDocument()
    })
  }
}
