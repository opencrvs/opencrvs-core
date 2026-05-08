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
import { fn } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { AppRouter } from '@client/v2-events/trpc'
import { V2_DEFAULT_MOCK_LOCATIONS } from '@opencrvs/commons/client'
import { UserSetupReview } from './SetupReviewPage'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof UserSetupReview> = {
  title: 'UserSetup/SetupReviewPage',
  component: UserSetupReview,
  parameters: {
    msw: {
      handlers: {
        locationGet: [
          tRPCMsw.locations.get.query((input) => {
            return (
              V2_DEFAULT_MOCK_LOCATIONS.find((l) => l.id === input.id) ??
              V2_DEFAULT_MOCK_LOCATIONS[0]
            )
          })
        ],
        userActivate: [tRPCMsw.user.activate.mutation(() => {})]
      }
    }
  },
  args: {
    setupData: {
      userId: 'test-user-id',
      password: 'test-password',
      securityQuestionAnswers: [{ questionKey: 'BIRTH_TOWN', answer: 'Lusaka' }]
    },
    goToStep: fn()
  }
}

export default meta
type Story = StoryObj<typeof UserSetupReview>

export const Default: Story = {}
