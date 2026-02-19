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
import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { expect, fn, userEvent, waitFor, within } from '@storybook/test'
import {
  tennisClubMembershipEvent,
  generateEventDraftDocument,
  TestUserRole,
  ActionType,
  EventConfig
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '../../events/fixtures'
import { EventOverviewIndex } from './EventOverview'

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview/Interaction',
  component: EventOverviewIndex,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventOverviewIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const tennisClubMembershipEventWithConfigurableSummaryFields: EventConfig = {
  ...tennisClubMembershipEvent,
  summary: {
    ...tennisClubMembershipEvent.summary,
    fields: [
      ...tennisClubMembershipEvent.summary.fields,
      {
        id: 'event.registeredAt',
        emptyValueMessage: {
          defaultMessage: 'No registration date',
          description: 'This is shown when there is no registration date',
          id: 'event.birth.summary.event.registeredAt.empty'
        },
        label: {
          defaultMessage: 'Registration date',
          description: 'This is the label for the registration date',
          id: 'event.birth.summary.event.registeredAt.label'
        },
        value: {
          defaultMessage: '{event.legalStatuses.REGISTERED.acceptedAt}',
          description: 'This is the registration date value',
          id: 'event.birth.summary.event.registeredAt.value'
        }
      },
      {
        eventFieldId: 'event.legalStatuses.REGISTERED.acceptedAt',
        emptyValueMessage: {
          defaultMessage: 'No registration date',
          description: 'This is shown when there is no registration date',
          id: 'event.birth.summary.event.registeredAt.empty'
        },
        label: {
          defaultMessage: 'Registration date from field id',
          description: 'This is the label for the registration date',
          id: 'event.birth.summary.event.registeredAtFieldId.label'
        }
      }
    ]
  }
}

export const WithConfigurableSummaryFieldHavingEventMetadataValue: Story = {
  parameters: {
    offline: {
      events: [tennisClubMembershipEventDocument],
      configs: [tennisClubMembershipEventWithConfigurableSummaryFields]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument({
                eventId: tennisClubMembershipEventDocument.id,
                actionType: ActionType.REGISTER,
                declaration: {
                  'applicant.name': {
                    firstname: 'Riku',
                    surname: 'This value is from a draft'
                  }
                }
              })
            ]
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    await step(
      'Check the registration date embedded in text is shown in the summary',
      async () => {
        const canvas = within(canvasElement)
        const registrationDateField =
          await canvas.findByText('Registration date')
        await expect(registrationDateField).toBeInTheDocument()

        const registrationDateValue = await canvas.findByText(
          '2025-01-23T05:35:27.689Z'
        )
        await expect(registrationDateValue).toBeInTheDocument()
      }
    )

    await step(
      'Check the registration date defined by eventFieldId is shown in the summary',
      async () => {
        const canvas = within(canvasElement)
        const registrationDateField = await canvas.findByText(
          'Registration date from field id'
        )
        await expect(registrationDateField).toBeInTheDocument()

        const registrationDateValue = await canvas.findByText('23 January 2025')
        await expect(registrationDateValue).toBeInTheDocument()
      }
    )
  }
}
