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

import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventIndex
} from '@client/v2-events/features/events/fixtures'
import { WorkqueueIndex } from '@client/v2-events/features/workqueues/Workqueue'
import { TRPCProvider } from '@client/v2-events/trpc'
import { AppRouter } from '@gateway/v2-events/events/router'
import type { Meta, StoryObj } from '@storybook/react'
import { createTRPCMsw } from 'msw-trpc'
import React from 'react'
import superjson from 'superjson'

const tRPCMsw = createTRPCMsw<AppRouter>({
  baseUrl: '/api/events',
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof WorkqueueIndex> = {
  title: 'Workqueue',
  component: WorkqueueIndex,

  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
export const Default: StoryObj<typeof WorkqueueIndex> = {
  parameters: {
    msw: {
      handlers: {
        events: [
          tRPCMsw.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.events.get.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ]
      }
    }
  }
}
