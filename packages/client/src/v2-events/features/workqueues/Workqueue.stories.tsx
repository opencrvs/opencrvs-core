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
