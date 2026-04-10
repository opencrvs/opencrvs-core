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

import { TRPCError } from '@trpc/server'
import { http, HttpResponse } from 'msw'
import {
  ActionType,
  encodeScope,
  FieldType,
  never,
  PageTypes
} from '@opencrvs/commons'
import {
  PRINT_CERTIFICATE_FORM,
  tennisClubMembershipEvent
} from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

test('prevents forbidden access if missing required scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.print-certified-copies',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    })
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`Has validation errors when required ${PageTypes.enum.VERIFICATION} page fields are missing`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        // The tennis club membership print certificate form has a verification page with conditional 'field('collector.requesterId').isEqualTo('INFORMANT')'
        // Thus if the requester is set as INFORMANT and verification page result is not set, we should see a validation error.
        annotation: { 'collector.requesterId': 'INFORMANT' }
      })
    )
  ).rejects.matchSnapshot()
})

test(`Has no validation errors when required ${PageTypes.enum.VERIFICATION} page fields are set`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        annotation: {
          'collector.requesterId': 'INFORMANT',
          'collector.identity.verify': true
        }
      })
    )
  ).resolves.toBeDefined()
})

test(`PRINT_CERTIFICATE action can not be performed on a declared, non-registered event`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [ActionType.DECLARE])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id)
    )
  ).rejects.toThrowErrorMatchingSnapshot()
})

test(`PRINT_CERTIFICATE action can be added to registered event`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  const printCertificate = await client.event.actions.printCertificate.request(
    generator.event.actions.printCertificate(event.id)
  )

  expect(printCertificate.actions.slice(-2)).toEqual([
    expect.objectContaining({ type: ActionType.PRINT_CERTIFICATE }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        annotation: {}
      })
    )
  ).rejects.matchSnapshot()
})

test(`PRINT_CERTIFICATE is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  const printCertificatePayload = generator.event.actions.printCertificate(
    event.id,
    { keepAssignment: true }
  )
  const firstResponse = await client.event.actions.printCertificate.request(
    printCertificatePayload
  )
  const secondResponse = await client.event.actions.printCertificate.request(
    printCertificatePayload
  )

  expect(firstResponse).toEqual(secondResponse)
})

test(`should not have validation errors for required fields on a hidden page`, async () => {
  const hiddenConditionalPage = {
    id: 'hiddenConditionalPageTest',
    type: PageTypes.enum.FORM,
    title: {
      id: 'event.tennis-club-membership.action.print.hiddenPageTest.title',
      defaultMessage: 'Hidden Page Test',
      description: 'This is the title of the section'
    },
    conditional: never(), // forces hidden → this is what we want to test
    fields: [
      {
        id: 'hiddenConditionalFieldTest',
        type: FieldType.TEXT,
        required: true,
        label: {
          defaultMessage: 'Hidden Conditional Field Test',
          description:
            'Field for entering Hidden Conditional Field details test',
          id: 'event.tennis-club-membership.action.form.section.hiddenConditionalFieldTest.label'
        }
      }
    ]
  }

  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  const printCertificateForm = {
    ...PRINT_CERTIFICATE_FORM,
    pages: [hiddenConditionalPage]
  }

  const customTennisClubMembershipEvent = {
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.map((action) => {
      if (action.type === ActionType.PRINT_CERTIFICATE) {
        return {
          ...action,
          printForm: printCertificateForm
        }
      }
      return action
    })
  }

  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([customTennisClubMembershipEvent])
    })
  )

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        annotation: {}
      })
    )
  ).resolves.toBeDefined()
})
