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
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { getToken, login } from '@e2e/support/helpers'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { expectInUrl, type } from '@e2e/support/utils'
import { createVersionedRecord } from '@e2e/support/form-versions'

/**
 * Version 'initial' keeps the father's name in the TEXT fields `father.firstname`
 * and `father.surname`. Version 'v2' keeps it in the NAME field `father.name`.
 * The search inputs and the deduplication of version 'initial' list both fields.
 */

/** A name that no other record has, so that search finds only the records of the test. */
function uniqueName() {
  return `Zq${faker.string.alpha({ length: 8, casing: 'lower' })}`
}

function getChild() {
  return {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0]
  }
}

function getMother() {
  return {
    'mother.name': {
      firstname: uniqueName(),
      surname: uniqueName()
    },
    'mother.dob': '1995-09-12',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }
}

function getFatherDetails(father: { firstname: string; surname: string }) {
  return {
    'father.detailsNotAvailable': false,
    'father.name': father,
    'father.dob': '1990-01-15',
    'father.nationality': 'FAR',
    'father.idType': 'NATIONAL_ID',
    'father.nid': faker.string.numeric(10),
    'father.addressSameAs': 'YES'
  }
}

/** The fields that only version 'initial' requires. */
const INITIAL_ONLY_FIELDS = { 'father.maritalStatus': 'MARRIED' }

test.describe("Search fields across birth versions: the father's name", () => {
  test("The father's first name and surname inputs find records of both versions", async ({
    page
  }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const father = { firstname: uniqueName(), surname: uniqueName() }
    const initialChild = getChild()
    const v2Child = getChild()

    await createVersionedRecord(
      token,
      BirthVersion.INITIAL,
      ActionType.REGISTER,
      {
        ...initialChild,
        ...getMother(),
        ...getFatherDetails(father),
        ...INITIAL_ONLY_FIELDS
      }
    )
    await createVersionedRecord(token, BirthVersion.V2, ActionType.REGISTER, {
      ...v2Child,
      ...getMother(),
      ...getFatherDetails(father)
    })

    await test.step("Search by the father's first name and surname", async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.click('#searchType')
      await expectInUrl(page, 'advanced-search')
      await page.getByText('Birth', { exact: true }).click()
      await page.getByText('Father details').click()
      await type(page, '#father____firstname', father.firstname)
      await type(page, '#father____surname', father.surname)
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
    })

    await test.step('The results have the records of both versions', async () => {
      await expect(
        page.getByText(formatV2ChildName(initialChild), { exact: true })
      ).toBeVisible()
      await expect(
        page.getByText(formatV2ChildName(v2Child), { exact: true })
      ).toBeVisible()
    })
  })

  test("An 'initial' record is a duplicate of a 'v2' record of the same child and father", async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const father = { firstname: uniqueName(), surname: uniqueName() }
    const child = getChild()

    const existing = await createVersionedRecord(
      token,
      BirthVersion.V2,
      ActionType.REGISTER,
      { ...child, ...getMother(), ...getFatherDetails(father) }
    )
    // The mother is different, so only the match on the child and the father flags the record.
    const flagged = await createVersionedRecord(
      token,
      BirthVersion.INITIAL,
      ActionType.DECLARE,
      {
        ...child,
        ...getMother(),
        ...getFatherDetails(father),
        ...INITIAL_ONLY_FIELDS
      }
    )

    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
    const event = await client.event.get.query({ eventId: flagged.eventId })
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
