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
import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { QueryKey } from '@tanstack/react-query'
import { TRPCError } from '@trpc/server'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { expect, screen, userEvent, within } from 'storybook/test'
import {
  ActionType,
  AdministrativeArea,
  ClientAdministrativeArea,
  encodeScope,
  generateActionDocument,
  generateEventDocument,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole,
  toClientAdministrativeArea,
  TokenUserType,
  UUID,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import {
  AppRouter,
  queryClient,
  TRPCProvider,
  trpcOptionsProxy
} from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  LOCATION_LIST_STALE_TIME_MS,
  SyncedCache
} from '@client/v2-events/hooks/incremental-sync'
import { EventOverviewIndex } from './EventOverview'

/*
 * Regression test for #14480.
 *
 * An integration creates an administrative area and then notifies a record
 * with its place of event in that area. The server puts the new area in the
 * hierarchy of the record, so the record shows in the workqueue of a
 * registrar of the parent area. The client of the registrar synced the list
 * of administrative areas before the area existed. When the registrar opens
 * the record after the stale time of the list, the client syncs the list
 * again, and the registrar gets the Record and Documents tabs and the actions
 * of the record.
 */

const generator = testDataGenerator()

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })]
})

const IBOMBO_ADMINISTRATIVE_AREA_ID =
  '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
const IBOMBO_DISTRICT_OFFICE_ID = '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
const TEST_NOTIFIER_CLIENT_ID = '5d1c3a0e-8a4f-4b6e-9c2d-7e1f0a9b8c3d' as UUID

const NEW_VILLAGE: AdministrativeArea = {
  id: 'f1e2d3c4-b5a6-4978-8a1b-2c3d4e5f6a7b' as UUID,
  name: 'Test Village',
  externalId: null,
  parentId: IBOMBO_ADMINISTRATIVE_AREA_ID,
  status: 'active',
  versions: [
    {
      versionId: 'f1e2d3c4-b5a6-4978-8a1b-2c3d4e5f6a7c' as UUID,
      effectiveFrom: '2026-11-23',
      name: 'Test Village',
      externalId: null,
      status: 'active'
    }
  ],
  updatedAt: '2026-11-23T10:00:00.000Z'
}

const ADMINISTRATIVE_AREAS_ON_SERVER = [
  ...V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  NEW_VILLAGE
]

const systemClientAction = {
  createdBy: TEST_NOTIFIER_CLIENT_ID,
  createdByUserType: TokenUserType.enum.system,
  createdByRole: undefined,
  createdAtLocation: IBOMBO_DISTRICT_OFFICE_ID
}

const notificationFromIntegration = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [],
  defaults: {
    actions: [
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.CREATE,
        defaults: systemClientAction
      }),
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.NOTIFY,
        defaults: systemClientAction
      })
    ]
  }
})

/*
 * The index that the server returns. The server resolves the place of event
 * of the notification to the new village.
 */
const notificationIndex = {
  ...getCurrentEventState(
    notificationFromIntegration,
    tennisClubMembershipEvent
  ),
  placeOfEvent: NEW_VILLAGE.id
}

/*
 * The registrar scopes of Farajaland: the record scopes are limited to the
 * administrative area of the user.
 */
const REGISTRAR_SCOPES_IN_OWN_AREA = [
  encodeScope({
    type: 'record.search',
    options: { placeOfEvent: 'administrativeArea' }
  }),
  encodeScope({
    type: 'record.read',
    options: { placeOfEvent: 'administrativeArea' }
  }),
  encodeScope({
    type: 'record.declare',
    options: { placeOfEvent: 'administrativeArea' }
  }),
  encodeScope({
    type: 'record.reject',
    options: { placeOfEvent: 'administrativeArea' }
  }),
  encodeScope({ type: 'record.unassign-others' })
]

/*
 * The preview uses a custom `token` only for the FIELD_AGENT role. The user
 * of that role works at Ibombo District Office in the Ibombo area.
 */
function buildFakeStorybookToken(scopes: string[]) {
  const base64UrlEncode = (input: string) =>
    btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      scope: scopes,
      userType: TokenUserType.enum.user,
      role: TestUserRole.enum.FIELD_AGENT,
      sub: generator.user.id.fieldAgent,
      iat: 1487076708,
      exp: 32503680000,
      iss: 'opencrvs:auth-service',
      aud: 'opencrvs:gateway-user'
    })
  )
  return `${header}.${payload}.signature`
}

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview/Interaction/NewAdministrativeArea',
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

export const ShowsTabsAndActionsForPlaceOfEventInNewArea: Story = {
  beforeEach: () => {
    /*
     * The client synced the list of administrative areas before the
     * integration created the new village, and longer ago than the stale
     * time of the list.
     */
    const syncedAt = Date.now() - 2 * LOCATION_LIST_STALE_TIME_MS
    const administrativeAreasKey: QueryKey =
      trpcOptionsProxy.administrativeAreas.list.queryKey()
    const areasBeforeNewVillage: SyncedCache<ClientAdministrativeArea> = {
      syncedAt: new Date(syncedAt).toISOString(),
      rows: new Map(
        V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS.map((area) => [
          area.id,
          toClientAdministrativeArea(area)
        ])
      )
    }

    queryClient.setQueryData(administrativeAreasKey, areasBeforeNewVillage, {
      updatedAt: syncedAt
    })
  },
  parameters: {
    userRole: TestUserRole.enum.FIELD_AGENT,
    token: buildFakeStorybookToken(REGISTRAR_SCOPES_IN_OWN_AREA),
    chromatic: { disableSnapshot: true },
    offline: {
      events: [],
      configs: [tennisClubMembershipEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({
        eventId: notificationFromIntegration.id
      })
    },
    msw: {
      handlers: {
        eventLocations: [
          tRPCMsw.locations.list.query(() => V2_DEFAULT_MOCK_LOCATIONS),
          tRPCMsw.locations.get.query(({ id }) => {
            const location = V2_DEFAULT_MOCK_LOCATIONS.find(
              (candidate) => candidate.id === id
            )
            if (!location) {
              throw new TRPCError({ code: 'NOT_FOUND' })
            }
            return location
          }),
          tRPCMsw.administrativeAreas.list.query(
            () => ADMINISTRATIVE_AREAS_ON_SERVER
          ),
          tRPCMsw.locations.sync.query(({ since }) => ({
            syncedAt: new Date().toISOString(),
            locations: since ? [] : V2_DEFAULT_MOCK_LOCATIONS
          })),
          // The new village is the only area written after the last sync.
          tRPCMsw.administrativeAreas.sync.query(({ since }) => ({
            syncedAt: new Date().toISOString(),
            administrativeAreas: since
              ? [NEW_VILLAGE]
              : ADMINISTRATIVE_AREAS_ON_SERVER
          }))
        ],
        event: [
          tRPCMsw.event.get.query(() => notificationFromIntegration),
          tRPCMsw.event.search.query(() => ({
            results: [notificationIndex],
            total: 1
          }))
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    /*
     * The preview waits up to 15 seconds in each find query, which is also
     * the time limit of the test runner. The tab checks wait for a shorter
     * time, so that a missing tab fails with its own error.
     */
    await step('The Record and Documents tabs are visible', async () => {
      await expect(
        await canvas.findByRole('button', { name: 'Summary' })
      ).toBeVisible()
      await expect(
        await canvas.findByRole('button', { name: 'Record' }, { timeout: 5000 })
      ).toBeVisible()
      await expect(
        await canvas.findByRole(
          'button',
          { name: 'Documents' },
          { timeout: 5000 }
        )
      ).toBeVisible()
    })

    await step('The action menu has the Assign action', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )

      await expect(
        await screen.findByText('Assign', {}, { timeout: 5000 })
      ).toBeVisible()
    })
  }
}
