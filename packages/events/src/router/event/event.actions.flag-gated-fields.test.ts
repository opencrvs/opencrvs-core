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
import { http, HttpResponse } from 'msw'
import {
  ActionType,
  AddressType,
  ActionUpdate,
  ConditionalType,
  EventConfig,
  flag,
  getCurrentEventState
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { CreatedUser, payloadGenerator } from '@events/tests/generators'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

/*
 * `flag(...)` in a *declaration field* conditional resolves from the event state
 * carried on the validator context. Without it the server evaluates every event
 * as unflagged, so it treats flag-gated fields as hidden and rejects values the
 * client legitimately collected with "Hidden or disabled field should not
 * receive a value".
 *
 * `applicant.email` is optional and ungated in the fixture. Gating it behind a
 * custom flag that DECLARE adds means REGISTER — a declaration-update action, so
 * it runs the full hidden-field check — sees an event that does carry the flag.
 */
const gatingFlag = 'email-unlocked'

const eventWithFlagGatedEmail = {
  ...tennisClubMembershipEvent,
  // Custom flags must be declared on the event before an action may reference them.
  flags: [
    ...tennisClubMembershipEvent.flags,
    {
      id: gatingFlag,
      requiresAction: false,
      label: {
        id: 'event.tennis-club-membership.flag.email-unlocked.label',
        defaultMessage: 'Email unlocked',
        description: 'Test flag gating the visibility of applicant.email'
      }
    }
  ],
  actions: tennisClubMembershipEvent.actions.map((action) =>
    action.type !== ActionType.DECLARE
      ? action
      : { ...action, flags: [{ id: gatingFlag, operation: 'add' }] }
  ),
  declaration: {
    ...tennisClubMembershipEvent.declaration,
    pages: tennisClubMembershipEvent.declaration.pages.map((page) => ({
      ...page,
      fields: page.fields.map((pageField) =>
        pageField.id !== 'applicant.email'
          ? pageField
          : {
              ...pageField,
              conditionals: [
                { type: ConditionalType.SHOW, conditional: flag(gatingFlag) }
              ]
            }
      )
    }))
  }
}

const email = 'jane@example.com'

const declarationWithoutEmail = {
  'applicant.dob': '2024-02-01',
  'applicant.dobUnknown': false,
  'applicant.name': { firstname: 'John', surname: 'Doe' },
  'recommender.none': true,
  'applicant.address': {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
    streetLevelDetails: { state: 'state', district2: 'district2' }
  }
} satisfies ActionUpdate

const declaration = {
  ...declarationWithoutEmail,
  'applicant.email': email
} satisfies ActionUpdate

describe('declaration updates with a flag-gated field', () => {
  let user: CreatedUser
  let generator: ReturnType<typeof payloadGenerator>

  beforeEach(async () => {
    const testCase = await setupTestCase()
    user = testCase.user
    generator = testCase.generator

    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
        HttpResponse.json([eventWithFlagGatedEmail])
      )
    )
  })

  test('REGISTER accepts the value when the event carries the gating flag', async () => {
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    // DECLARE adds the gating flag, which makes applicant.email visible.
    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        declaration: declarationWithoutEmail
      })
    )
    // DECLARE releases the assignment; REGISTER needs it back.
    await client.event.actions.assignment.assign(
      generator.event.actions.assign(event.id, {
        assignedTo: event.actions[0].createdBy
      })
    )

    const response = await client.event.actions.register.request(
      generator.event.actions.register(event.id, { declaration })
    )

    const state = getCurrentEventState(
      response,
      eventWithFlagGatedEmail as EventConfig
    )

    expect(state.declaration['applicant.email']).toBe(email)
  })

  test('DECLARE rejects the value when the event does not carry the gating flag', async () => {
    const client = createTestClient(user)
    // The flag is only added once DECLARE is accepted, so during its own
    // validation the field is still hidden.
    const event = await client.event.create(generator.event.create())

    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(event.id, { declaration })
      )
    ).rejects.toThrow(/Hidden or disabled field should not receive a value/)
  })
})
