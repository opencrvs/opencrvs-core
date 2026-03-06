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

import fc from 'fast-check'
import {
  ActionType,
  AddressType,
  JurisdictionFilter,
  TENNIS_CLUB_MEMBERSHIP,
  encodeScope,
  getUUID
} from '@opencrvs/commons'
import {
  assertScopeResult,
  attemptScopedAction,
  createTestClient,
  setupScopeTestFixture
} from '@events/tests/utils'

test('Check scopes against event.actions.declare', async () => {
  const { users, administrativeAreas, isUnderAdministrativeArea, eventIds } =
    await setupScopeTestFixture(12434532, [ActionType.UNASSIGN])

  const administrativeAreaId = administrativeAreas.find(
    (aa) => aa.name === 'District C'
  )?.id

  const clientReadingAllEvents = createTestClient(users[0], [
    encodeScope({
      type: 'record.read'
    })
  ])

  const combinations = fc.record({
    user: fc.constantFrom(...users),
    event: fc.option(
      fc.constantFrom<string[]>(
        [TENNIS_CLUB_MEMBERSHIP],
        [TENNIS_CLUB_MEMBERSHIP, 'tennis-club-membership_premium'],
        ['tennis-club-membership_premium']
      ),
      { nil: undefined }
    ),
    placeOfEvent: fc.option(fc.constantFrom(...JurisdictionFilter.options), {
      nil: undefined
    }),
    scopeType: fc.constantFrom('record.declare', 'record.register')
  })

  await fc.assert(
    fc.asyncProperty(
      combinations,
      async ({ user, event, placeOfEvent, scopeType }) => {
        const scope = encodeScope({
          type: scopeType,
          options: { event, placeOfEvent }
        })

        const randomIndex = Math.floor(Math.random() * eventIds.length)
        const [eventId] = eventIds.splice(randomIndex, 1)

        const result = await attemptScopedAction(
          eventId,
          user,
          scope,
          clientReadingAllEvents,
          (client) =>
            client.event.actions.declare.request({
              eventId,
              transactionId: getUUID(),
              declaration: {
                'applicant.dob': '1990-02-01',
                'applicant.name': { firstname: 'John', surname: 'Doe' },
                'recommender.none': true,
                'applicant.address': {
                  country: 'FAR',
                  addressType: AddressType.DOMESTIC,
                  administrativeArea: administrativeAreaId,
                  streetLevelDetails: { state: 'state', district2: 'district2' }
                }
              }
            })
        )

        assertScopeResult(result, {
          user,
          event,
          placeOfEvent,
          isUnderAdministrativeArea
        })
      }
    ),
    { numRuns: 40 }
  )
})
