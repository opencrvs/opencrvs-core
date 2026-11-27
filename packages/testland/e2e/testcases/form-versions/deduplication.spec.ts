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
import { expect, test, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionStatus, ActionType } from '@opencrvs/toolkit/events'
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { getToken, login } from '@e2e/support/helpers'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { getSignatureFile, uploadFile } from '@e2e/support/test-data/utils'
import { createVersionedRecord } from '@e2e/support/form-versions'

/** Fields that the dedup query compares. Both records of a pair share them. */
function getSharedIdentity() {
  return {
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
}

/** Fields that only version `initial` has. The informant is a brother. */
const INITIAL_ONLY_FIELDS = {
  'informant.relation': 'BROTHER',
  'mother.maritalStatus': 'MARRIED'
}

/** Fields that only version `v2` has. The informant is a legal guardian. */
const V2_ONLY_FIELDS = {
  'informant.relation': 'LEGAL_GUARDIAN',
  'child.birthType': 'TWIN',
  'child.weightAtBirth': 3.2
}

const VERSION_FIELDS = {
  [BirthVersion.INITIAL]: INITIAL_ONLY_FIELDS,
  [BirthVersion.V2]: V2_ONLY_FIELDS
}

/**
 * Registers a record under `existingVersion`, then declares a matching record
 * under `newVersion`. The second record must be flagged as a duplicate of the first.
 */
async function createMixedPair(
  existingVersion: BirthVersion,
  newVersion: BirthVersion
) {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const identity = getSharedIdentity()

  const existing = await createVersionedRecord(
    token,
    existingVersion,
    ActionType.REGISTER,
    { ...identity, ...VERSION_FIELDS[existingVersion] }
  )
  const flagged = await createVersionedRecord(
    token,
    newVersion,
    ActionType.DECLARE,
    { ...identity, ...VERSION_FIELDS[newVersion] }
  )

  return {
    name: formatV2ChildName(identity),
    existing: {
      eventId: existing.eventId,
      trackingId: existing.trackingId!,
      version: existingVersion
    },
    flagged: {
      eventId: flagged.eventId,
      trackingId: flagged.trackingId!,
      version: newVersion
    }
  }
}

type MixedPair = Awaited<ReturnType<typeof createMixedPair>>

async function openDuplicateReview(page: Page, pair: MixedPair) {
  await login(page, CREDENTIALS.REGISTRAR)
  await page.getByRole('button', { name: 'Potential duplicate' }).click()
  await openRecordByTitle(page, pair.name)
  await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  await expect(
    page.getByText(`Potential duplicate of record ${pair.existing.trackingId}`)
  ).toBeVisible()
  await selectAction(page, 'Review potential duplicates')
}

/** Returns the cell of the flagged record (left) and of the existing record (right) in the row `label`. */
function comparisonRow(page: Page, label: string) {
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('rowheader', { name: label, exact: true }) })
  return {
    flagged: row.getByRole('cell').nth(0),
    existing: row.getByRole('cell').nth(1)
  }
}

async function getEvent(eventId: string) {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  return client.event.get.query({ eventId })
}

async function expectFlagged(pair: MixedPair) {
  const event = await getEvent(pair.flagged.eventId)
  expect(event.actions.map(({ type }) => type)).toContain(
    ActionType.DUPLICATE_DETECTED
  )
}

/** The flagged record is version v2, so its page titles and labels win. */
async function expectV2ComparedWithInitial(page: Page) {
  const placeOfBirth = comparisonRow(page, 'Place of delivery')
  await expect(placeOfBirth.flagged).toContainText('Residential address')
  await expect(placeOfBirth.existing).toContainText('Residential address')
  await expect(
    page.getByRole('rowheader', { name: 'Facility of occurrence' })
  ).toHaveCount(0)

  const birthType = comparisonRow(page, 'Type of birth')
  await expect(birthType.flagged).toContainText('Twin')
  await expect(birthType.existing).not.toContainText('Twin')

  const weight = comparisonRow(page, 'Weight at birth')
  await expect(weight.flagged).toContainText('3.2')
  await expect(weight.existing).not.toContainText('3.2')

  const maritalStatus = comparisonRow(page, 'Marital Status')
  await expect(maritalStatus.existing).toContainText('Married')
  await expect(maritalStatus.flagged).not.toContainText('Married')

  const informant = comparisonRow(page, 'Relationship to child')
  await expect(informant.flagged).toContainText('Legal guardian')
  await expect(informant.existing).toContainText('Brother')
}

/** The flagged record is version initial, so its page titles and labels win. */
async function expectInitialComparedWithV2(page: Page) {
  const placeOfBirth = comparisonRow(page, 'Facility of occurrence')
  await expect(placeOfBirth.flagged).toContainText('Residential address')
  await expect(placeOfBirth.existing).toContainText('Residential address')
  await expect(
    page.getByRole('rowheader', { name: 'Place of delivery' })
  ).toHaveCount(0)

  const birthType = comparisonRow(page, 'Type of birth')
  await expect(birthType.existing).toContainText('Twin')
  await expect(birthType.flagged).not.toContainText('Twin')

  const weight = comparisonRow(page, 'Weight at birth')
  await expect(weight.existing).toContainText('3.2')
  await expect(weight.flagged).not.toContainText('3.2')

  const maritalStatus = comparisonRow(page, 'Marital Status')
  await expect(maritalStatus.flagged).toContainText('Married')
  await expect(maritalStatus.existing).not.toContainText('Married')

  const informant = comparisonRow(page, 'Relationship to child')
  await expect(informant.flagged).toContainText('Brother')
  await expect(informant.existing).toContainText('Legal guardian')
}

/** Marks the flagged record as not a duplicate, then registers it over the API. */
async function markNotDuplicateAndRegister(page: Page, pair: MixedPair) {
  await page
    .getByRole('button', { name: pair.flagged.trackingId, exact: true })
    .click()
  await page.locator('#not-a-duplicate').click()
  await page.locator('#not-duplicate-confirm').click()
  await expect(page.getByTestId('status-value')).toBeVisible()

  // The client sends the action through its outbox, so wait for the server to have it.
  await expect(async () => {
    const event = await getEvent(pair.flagged.eventId)
    expect(event.actions.map(({ type }) => type)).toContain(
      ActionType.MARK_AS_NOT_DUPLICATE
    )
  }).toPass({ timeout: 15_000 })

  const token = await getToken(CREDENTIALS.REGISTRAR)
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  await client.event.actions.register.request.mutate({
    eventId: pair.flagged.eventId,
    transactionId: uuidv4(),
    declaration: {},
    annotation: {
      'review.comment': 'Not a duplicate',
      // Version 'initial' of the birth form does not ask for the signature of the informant.
      ...(pair.flagged.version === BirthVersion.V2
        ? { 'review.signature': await uploadFile(getSignatureFile(), token) }
        : {})
    }
  })

  await expect(async () => {
    const event = await getEvent(pair.flagged.eventId)
    expect(event.configVersionId).toBe(pair.flagged.version)
    expect(
      event.actions.map(({ type, status }) => `${type}:${status}`)
    ).toContain(`${ActionType.REGISTER}:${ActionStatus.Accepted}`)
  }).toPass({ timeout: 15_000 })
}

/** Marks the flagged record as a duplicate of the existing record. */
async function markAsDuplicate(page: Page, pair: MixedPair) {
  await page
    .getByRole('button', { name: pair.flagged.trackingId, exact: true })
    .click()
  await page.getByRole('button', { name: 'Mark as duplicate' }).click()
  await page.locator('.react-select__control').first().click()
  await page
    .locator('.react-select__option')
    .getByText(pair.existing.trackingId)
    .click()
  await page.locator('#describe-reason').fill('Same child')
  await page.getByTestId('mark-as-duplicate-button').click()

  await expect(async () => {
    const flagged = await getEvent(pair.flagged.eventId)
    expect(flagged.actions.map(({ type }) => type)).toContain(
      ActionType.MARK_AS_DUPLICATE
    )
    expect(flagged.configVersionId).toBe(pair.flagged.version)
  }).toPass({ timeout: 15_000 })

  const existing = await getEvent(pair.existing.eventId)
  expect(existing.configVersionId).toBe(pair.existing.version)
  expect(existing.actions.map(({ type }) => type)).not.toContain(
    ActionType.MARK_AS_DUPLICATE
  )
}

const TEST_CASES = [
  {
    title: "A 'v2' record that matches an 'initial' record",
    existingVersion: BirthVersion.INITIAL,
    newVersion: BirthVersion.V2,
    expectComparison: expectV2ComparedWithInitial
  },
  {
    title: "An 'initial' record that matches a 'v2' record",
    existingVersion: BirthVersion.V2,
    newVersion: BirthVersion.INITIAL,
    expectComparison: expectInitialComparedWithV2
  }
]

test.describe('Deduplication across birth versions', () => {
  for (const testCase of TEST_CASES) {
    test.describe(testCase.title, () => {
      /** Creates the pair, checks that it is flagged, and opens the comparison. */
      async function reviewNewPair(page: Page) {
        const pair = await createMixedPair(
          testCase.existingVersion,
          testCase.newVersion
        )

        await test.step('The record is flagged as a potential duplicate', async () => {
          await expectFlagged(pair)
        })

        await test.step('The comparison shows the fields of each version', async () => {
          await openDuplicateReview(page, pair)
          await page
            .getByRole('button', {
              name: pair.existing.trackingId,
              exact: true
            })
            .click()
          await testCase.expectComparison(page)
        })

        return pair
      }

      test("'Not a duplicate' lets the record be registered under its own version", async ({
        page
      }) => {
        const pair = await reviewNewPair(page)

        await test.step("Mark as 'Not a duplicate' and register", async () => {
          await markNotDuplicateAndRegister(page, pair)
        })
      })

      test("'Mark as duplicate' marks the record and leaves the other one as it is", async ({
        page
      }) => {
        const pair = await reviewNewPair(page)

        await test.step('Mark as duplicate of the existing record', async () => {
          await markAsDuplicate(page, pair)
        })
      })
    })
  }
})

test.describe('Deduplication with a list of fields to match against', () => {
  test("A 'v2' record with the mother's date of birth matches an 'initial' record with only the mother's age", async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const identity = getSharedIdentity()
    const motherAge = 30
    const [childBirthYear, ...childBirthMonthAndDay] =
      identity['child.dob'].split('-')
    const motherDob = [
      Number(childBirthYear) - motherAge,
      ...childBirthMonthAndDay
    ].join('-')

    const existing = await createVersionedRecord(
      token,
      BirthVersion.INITIAL,
      ActionType.REGISTER,
      {
        ...identity,
        ...INITIAL_ONLY_FIELDS,
        'mother.dob': undefined,
        'mother.dobUnknown': true,
        'mother.age': { age: motherAge, asOfDateRef: 'child.dob' }
      }
    )
    const flagged = await createVersionedRecord(
      token,
      BirthVersion.V2,
      ActionType.DECLARE,
      { ...identity, ...V2_ONLY_FIELDS, 'mother.dob': motherDob }
    )

    const event = await getEvent(flagged.eventId)
    const duplicates = event.actions.flatMap((action) =>
      action.type === ActionType.DUPLICATE_DETECTED
        ? action.content.duplicates
        : []
    )
    expect(duplicates).toContainEqual({
      id: existing.eventId,
      trackingId: existing.trackingId
    })
  })
})
