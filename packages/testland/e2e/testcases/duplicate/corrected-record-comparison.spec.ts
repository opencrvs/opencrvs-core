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
import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import {
  ActionDocument,
  ActionType,
  AddressType
} from '@opencrvs/toolkit/events'
import { getToken, login } from '@e2e/support/helpers'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration-with-mother-father'
import {
  formatV2ChildName,
  getAdministrativeAreas,
  getLocations,
  getIdByName
} from '@e2e/support/birth/helpers'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

/**
 * Regression test for opencrvs-core#12848.
 */
test('Corrected place of birth (PRIVATE_HOME → HEALTH_FACILITY) is not shown struck-through in duplicate comparison view', async ({
  page
}) => {
  const sharedDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0],
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const CORRECTED_FACILITY = 'Klow Village Hospital'

  let eventId: string
  let token: string
  let trackingId: string

  await test.step('Register the original record with a PRIVATE_HOME place of birth', async () => {
    token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, sharedDetails)
    eventId = res.eventId
    trackingId = res.trackingId!
    expect(res.registrationNumber).toBeDefined()
  })

  await test.step('Correct the original record’s place of birth from a private home to Klow Village Hospital', async () => {
    const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)

    const userId = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    ).sub
    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: userId
    })

    const facilities = await getLocations('HEALTH_FACILITY', token)
    const correctedFacilityId = getIdByName(facilities, CORRECTED_FACILITY)

    const requestRes =
      await client.event.actions.correction.request.request.mutate({
        eventId,
        transactionId: uuidv4(),
        declaration: {
          'child.placeOfBirth': 'HEALTH_FACILITY',
          'child.birthLocation': correctedFacilityId,
          'child.birthLocationId': correctedFacilityId,
          'child.birthLocation.privateHome': null
        },
        annotation: {
          'review.comment': 'Correct place of birth from private home'
        },
        keepAssignmentIfAccepted: true
      })

    const acceptedRequest = requestRes.actions.find(
      (action: ActionDocument) =>
        action.type === ActionType.REQUEST_CORRECTION &&
        action.status === 'Accepted'
    )

    expect(acceptedRequest).toBeDefined()

    await client.event.actions.correction.approve.request.mutate({
      eventId,
      transactionId: uuidv4(),
      requestId: acceptedRequest!.id,
      declaration: {},
      annotation: {}
    })
  })

  await test.step('Create a second declaration that becomes a potential duplicate', async () => {
    const duplicateToken = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(duplicateToken, sharedDetails, ActionType.DECLARE)
  })

  await test.step('Open the duplicate record in the comparison view', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, formatV2ChildName(sharedDetails))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')
  })

  await test.step('Select the original record tab', async () => {
    await page.getByRole('button', { name: trackingId, exact: true }).click()
  })

  await test.step('Corrected Location of birth is rendered without strikethrough', async () => {
    await expect(page.getByText(CORRECTED_FACILITY).first()).toBeVisible()

    await expect(
      page.getByRole('deletion').filter({ hasText: 'Central' })
    ).toHaveCount(0)
  })
})

/**
 * Regression test for opencrvs-core#12848 — reverse direction.
 */
test('Corrected place of birth (HEALTH_FACILITY → PRIVATE_HOME) is not shown struck-through in duplicate comparison view', async ({
  page
}) => {
  const sharedDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0],
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const ORIGINAL_FACILITY = 'Klow Village Hospital'
  const CORRECTED_TOWN = 'Dhaka'

  let eventId: string
  let token: string
  let trackingId: string

  await test.step('Register the original record with a HEALTH_FACILITY place of birth', async () => {
    token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      token,
      sharedDetails,
      ActionType.REGISTER,
      'HEALTH_FACILITY'
    )
    eventId = res.eventId
    trackingId = res.trackingId!
    expect(res.registrationNumber).toBeDefined()
  })

  await test.step('Correct the original record’s place of birth from Klow Village Hospital to a private home', async () => {
    const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)

    const userId = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    ).sub
    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: userId
    })

    const administrativeAreas = await getAdministrativeAreas(token)
    const village = getIdByName(administrativeAreas, 'Klow')

    const requestRes =
      await client.event.actions.correction.request.request.mutate({
        eventId,
        transactionId: uuidv4(),
        declaration: {
          'child.placeOfBirth': 'PRIVATE_HOME',
          'child.birthLocation.privateHome': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: village,
            streetLevelDetails: { town: CORRECTED_TOWN }
          },
          'child.birthLocationId': village,
          'child.birthLocation': null
        },
        annotation: {
          'review.comment':
            'Correct place of birth from hospital to private home'
        },
        keepAssignmentIfAccepted: true
      })

    const acceptedRequest = requestRes.actions.find(
      (action: ActionDocument) =>
        action.type === ActionType.REQUEST_CORRECTION &&
        action.status === 'Accepted'
    )

    expect(acceptedRequest).toBeDefined()

    await client.event.actions.correction.approve.request.mutate({
      eventId,
      transactionId: uuidv4(),
      requestId: acceptedRequest!.id,
      declaration: {},
      annotation: {}
    })
  })

  await test.step('Create a second declaration that becomes a potential duplicate', async () => {
    const duplicateToken = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(
      duplicateToken,
      sharedDetails,
      ActionType.DECLARE,
      'HEALTH_FACILITY'
    )
  })

  await test.step('Open the duplicate record in the comparison view', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, formatV2ChildName(sharedDetails))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review potential duplicates')
  })

  await test.step('Select the original record tab', async () => {
    await page.getByRole('button', { name: trackingId, exact: true }).click()
  })

  await test.step('Corrected Location of birth is rendered without strikethrough', async () => {
    await expect(page.getByText(CORRECTED_TOWN).first()).toBeVisible()

    await expect(
      page.getByRole('deletion').filter({ hasText: ORIGINAL_FACILITY })
    ).toHaveCount(0)
  })
})
