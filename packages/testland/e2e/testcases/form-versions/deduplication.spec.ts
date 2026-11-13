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
    existing: { eventId: existing.eventId, trackingId: existing.trackingId! },
    flagged: { eventId: flagged.eventId, trackingId: flagged.trackingId! }
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

test.describe('Deduplication across birth versions', () => {
  test("A 'v2' record that matches an 'initial' record", async ({ page }) => {
    const pair = await createMixedPair(BirthVersion.INITIAL, BirthVersion.V2)

    await test.step('The record is flagged as a potential duplicate', async () => {
      await expectFlagged(pair)
    })

    await test.step('The comparison shows the fields of each version', async () => {
      await openDuplicateReview(page, pair)
      await page
        .getByRole('button', { name: pair.existing.trackingId, exact: true })
        .click()

      // The flagged record is version v2, so its label wins.
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
    })

    await test.step("'Not a duplicate' lets the record be registered under its own version", async () => {
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
      const signature = await uploadFile(getSignatureFile(), token)
      await client.event.actions.register.request.mutate({
        eventId: pair.flagged.eventId,
        transactionId: uuidv4(),
        declaration: {},
        annotation: {
          'review.comment': 'Not a duplicate',
          'review.signature': signature
        }
      })

      await expect(async () => {
        const event = await getEvent(pair.flagged.eventId)
        expect(event.configVersionId).toBe(BirthVersion.V2)
        expect(
          event.actions.map(({ type, status }) => `${type}:${status}`)
        ).toContain(`${ActionType.REGISTER}:${ActionStatus.Accepted}`)
      }).toPass({ timeout: 15_000 })
    })
  })

  test("An 'initial' record that matches a 'v2' record", async ({ page }) => {
    const pair = await createMixedPair(BirthVersion.V2, BirthVersion.INITIAL)

    await test.step('The record is flagged as a potential duplicate', async () => {
      await expectFlagged(pair)
    })

    await test.step('The comparison shows the fields of each version', async () => {
      await openDuplicateReview(page, pair)
      await page
        .getByRole('button', { name: pair.existing.trackingId, exact: true })
        .click()

      // The flagged record is version initial, so its label wins.
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
    })

    await test.step("'Mark as duplicate' archives the record and leaves the other one as it is", async () => {
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
        expect(flagged.configVersionId).toBe(BirthVersion.INITIAL)
      }).toPass({ timeout: 15_000 })

      const existing = await getEvent(pair.existing.eventId)
      expect(existing.configVersionId).toBe(BirthVersion.V2)
      expect(existing.actions.map(({ type }) => type)).not.toContain(
        ActionType.MARK_AS_DUPLICATE
      )
    })
  })
})
