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
import superjson from 'superjson'
import { ROUTES } from '@client/v2-events/routes'
import { tennisClueMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { router } from '@client/v2-events/features/events/actions/correct/request/router'
import { Onboarding as OnboardingIndex } from '@client/v2-events/features/events/actions/correct/request/index'

const meta: Meta<typeof Onboarding> = {
  title: 'CorrectionRequest'
}

export default meta

type Story = StoryObj<typeof OnboardingIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const Onboarding: Story = {
  parameters: {
    reactRouter: {
      router: router,
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath({
        eventId: tennisClueMembershipEventDocument.id,
        pageId: 'corrector'
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClueMembershipEventDocument
          })
        ]
      }
    }
  }
}
