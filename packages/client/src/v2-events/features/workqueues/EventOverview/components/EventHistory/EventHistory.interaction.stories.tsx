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
import React from 'react'
import superjson from 'superjson'
import { expect, userEvent, within } from '@storybook/test'
import {
  ActionDocument,
  ActionType,
  ConditionalType,
  createPrng,
  event,
  EventConfig,
  EventDocument,
  FieldType,
  generateActionDocument,
  generateRandomDatetime,
  getCurrentEventState,
  getUUID,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { EventOverviewIndex } from '../../EventOverview'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const refData = testDataGenerator()

const GATED_FIELD_ID = 'applicant.registrationNumber'
const GATED_FIELD_LABEL = 'Registration number'

const [applicantPage, ...otherPages] =
  tennisClubMembershipEvent.declaration.pages

/**
 * A configuration where one declaration field is only shown once the record has
 * been registered, i.e. its visibility depends on `$event` rather than on the
 * declaration itself.
 *
 * Serialised the way a country configuration reaches the client, which drops the
 * chainable helpers the `event.hasAction(...)` builder returns alongside the
 * schema. They cannot be stored in the offline cache.
 */
const eventConfig = JSON.parse(
  JSON.stringify({
    ...tennisClubMembershipEvent,
    declaration: {
      ...tennisClubMembershipEvent.declaration,
      pages: [
        {
          ...applicantPage,
          fields: [
            ...applicantPage.fields,
            {
              id: GATED_FIELD_ID,
              type: FieldType.TEXT,
              label: {
                defaultMessage: GATED_FIELD_LABEL,
                description: 'This is the label for the field',
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.registrationNumber.label'
              },
              conditionals: [
                {
                  type: ConditionalType.SHOW,
                  conditional: event.hasAction(ActionType.REGISTER)
                }
              ]
            }
          ]
        },
        ...otherPages
      ]
    }
  })
) as EventConfig

const actionDefaults = {
  createdAt: generateRandomDatetime(
    createPrng(73),
    new Date('2024-03-01'),
    new Date('2024-04-01')
  ),
  createdBy: refData.user.id.localRegistrar,
  createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
  createdAtLocation: refData.user.localRegistrar().v2.primaryOfficeId,
  transactionId: getUUID()
} satisfies Partial<ActionDocument>

/**
 * The registration fills in the registration number - the field which is only
 * shown once the record has been registered - alongside a plain field.
 */
const registeredEvent: EventDocument = {
  ...tennisClubMembershipEventDocument,
  actions: [
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.CREATE,
      defaults: { ...actionDefaults, declaration: {} }
    }),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        assignedTo: refData.user.id.localRegistrar
      }
    }),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.DECLARE,
      defaults: {
        ...actionDefaults,
        declaration: {
          'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' },
          'applicant.dob': '1999-11-11'
        }
      }
    }),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.REGISTER,
      defaults: {
        ...actionDefaults,
        declaration: {
          'applicant.dob': '1999-12-12',
          [GATED_FIELD_ID]: '2025-1'
        }
      }
    }),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        assignedTo: refData.user.id.localRegistrar
      }
    })
  ]
}

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventHistory/Interaction',
  component: EventOverviewIndex,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    /*
     * `configs` must be set: event configurations are looked up by id and the
     * first match wins, so without it the default tennis club membership
     * configuration shadows the one declaring the field under test.
     */
    offline: {
      configs: [eventConfig],
      events: [registeredEvent]
    }
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

/**
 * The audit trail must show every changed field, including the ones whose
 * visibility depends on `$event`. Those evaluate to hidden - and are silently
 * left out of the diff - unless the event is part of the validator context the
 * history is rendered with.
 */
export const ShowsEventDependentFieldInUpdateDetails: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({
        eventId: registeredEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [eventConfig]
          }),
          tRPCMsw.event.get.query(() => {
            return registeredEvent
          }),
          tRPCMsw.event.search.query(() => {
            return {
              results: [getCurrentEventState(registeredEvent, eventConfig)],
              total: 1
            }
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'open the details of the update made on registration',
      async () => {
        await userEvent.click(await canvas.findByText('Updated'))
      }
    )

    await step('registration number is part of the update', async () => {
      const dialog = within(await canvas.findByRole('dialog'))

      await expect(await dialog.findByText(GATED_FIELD_LABEL)).toBeVisible()
      await expect(await dialog.findByText('2025-1')).toBeVisible()
    })
  }
}
