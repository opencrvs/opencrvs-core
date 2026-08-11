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

// TestRail Test Case ID: 2482---https://ocrvs.testrail.io/index.php?/cases/view/2482
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { format, subDays, addDays, subYears } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { getToken, login } from '../../../../helpers'
import { CREDENTIALS, GATEWAY_HOST } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import { getSignatureFile, uploadFile } from '../../../test-data/utils'
import {
  formatV2ChildName,
  assertRecordInWorkqueue
} from '../../../birth/helpers'
import { ensureAssignedToUser } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'

const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')

function fakerNameAtLeast(min: number, generator: () => string): string {
  let value = generator()
  while (value.length < min) {
    value = generator()
  }
  return value
}

function withOneLetterChanged(value: string): string {
  const first = value[0]
  const base = first.toLowerCase()
  const replacement =
    base === 'z' ? 'a' : String.fromCharCode(base.charCodeAt(0) + 1)
  const isUpperCase = first === first.toUpperCase()

  return (
    (isUpperCase ? replacement.toUpperCase() : replacement) + value.slice(1)
  )
}

async function buildAnnotation(token: string) {
  const filename = await uploadFile(getSignatureFile(), token)
  return {
    'review.comment': 'Edited before re-submitting',
    'review.signature': filename
  }
}

function getUserIdFromToken(token: string): string {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
}

test('3.1. Editing a declaration to match an existing record flags it as a potential duplicate on re-declare', async ({
  page
}) => {
  const childFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const childSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const motherFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const motherSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const motherDob = isoDate(subYears(new Date(), 28))
  const motherNid = faker.string.numeric(10)
  const childOneDob = isoDate(subDays(new Date(), 30))
  const childTwoDob = isoDate(addDays(subDays(new Date(), 30), 3))

  const baselineDetails = {
    'child.name': { firstname: childFirstName, surname: childSurname },
    'child.dob': childOneDob,
    'mother.name': { firstname: motherFirstName, surname: motherSurname },
    'mother.dob': motherDob,
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': motherNid
  }

  const dissimilarDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 200)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 22)),
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const editedDetails = {
    'child.name': {
      firstname: withOneLetterChanged(childFirstName),
      surname: withOneLetterChanged(childSurname)
    },
    'child.dob': childTwoDob,
    'mother.name': {
      firstname: withOneLetterChanged(motherFirstName),
      surname: withOneLetterChanged(motherSurname)
    },
    'mother.dob': motherDob,
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': motherNid
  }

  let baselineTrackingId: string
  let editedToken: string
  let editedEventId: string

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.trackingId).toBeDefined()
    baselineTrackingId = res.trackingId!
  })

  await test.step('Declare a second, dissimilar declaration (not yet a duplicate)', async () => {
    editedToken = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      editedToken,
      dissimilarDetails,
      ActionType.DECLARE
    )
    editedEventId = res.eventId
  })

  await test.step('Edit it to match the baseline declaration, then re-declare', async () => {
    const client = createClient(
      `${GATEWAY_HOST}/events`,
      `Bearer ${editedToken}`
    )

    await client.event.actions.assignment.assign.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: getUserIdFromToken(editedToken)
    })

    const annotation = await buildAnnotation(editedToken)

    await client.event.actions.edit.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignmentIfAccepted: true
    })

    await client.event.actions.declare.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignment: true
    })
  })

  await test.step('Open the edited declaration from the Potential duplicate workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, formatV2ChildName(editedDetails))
  })

  await test.step('The edited declaration is flagged as a potential duplicate of the baseline', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(
      page.getByText(`Potential duplicate of record ${baselineTrackingId}`)
    ).toBeVisible()
  })
})

test('3.2. Editing a declaration while keeping it dissimilar does not flag it as a duplicate on re-declare', async ({
  page
}) => {
  const baselineDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 30)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 27)),
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const dissimilarDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 200)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 22)),
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const editedDetails = {
    ...dissimilarDetails,
    'mother.nid': faker.string.numeric(10)
  }

  let editedToken: string
  let editedEventId: string

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.trackingId).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration', async () => {
    editedToken = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      editedToken,
      dissimilarDetails,
      ActionType.DECLARE
    )
    editedEventId = res.eventId
  })

  await test.step('Edit it (still dissimilar), then re-declare', async () => {
    const client = createClient(
      `${GATEWAY_HOST}/events`,
      `Bearer ${editedToken}`
    )

    await client.event.actions.assignment.assign.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: getUserIdFromToken(editedToken)
    })

    const annotation = await buildAnnotation(editedToken)

    await client.event.actions.edit.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignmentIfAccepted: true
    })

    await client.event.actions.declare.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignment: true
    })
  })

  await test.step('The edited declaration is not flagged as a potential duplicate', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await assertRecordInWorkqueue({
      page,
      name: formatV2ChildName(editedDetails),
      workqueues: [
        { title: 'Potential duplicate', exists: false },
        { title: 'Pending registration', exists: true }
      ]
    })
  })
})
