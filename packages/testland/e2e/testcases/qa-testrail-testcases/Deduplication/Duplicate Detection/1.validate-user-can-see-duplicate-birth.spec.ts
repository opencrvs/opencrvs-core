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
// TestRail Test Case ID: 2474---https://ocrvs.testrail.io/index.php?/cases/view/2474
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { format, subDays, addDays, subYears } from 'date-fns'
import {
  getToken,
  login,
  continueForm,
  goToSection,
  drawSignature,
  triggerDeclarationAction,
  formatName,
  searchFromSearchBar
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import {
  formatV2ChildName,
  assertRecordInWorkqueue,
  openBirthDeclaration,
  fillDate
} from '../../../birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssignedToUser } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'

const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')

const toDateParts = (date: Date) => ({
  dd: format(date, 'dd'),
  mm: format(date, 'MM'),
  yyyy: format(date, 'yyyy')
})

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

test('1.1. Standard checks for duplicate record flag the second declaration as a potential duplicate', async ({
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

  const firstDeclarationDetails = {
    'child.name': { firstname: childFirstName, surname: childSurname },
    'child.dob': childOneDob,
    'mother.name': { firstname: motherFirstName, surname: motherSurname },
    'mother.dob': motherDob,
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': motherNid
  }

  const secondDeclarationDetails = {
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

  const secondDeclarationName = formatV2ChildName(secondDeclarationDetails)
  let trackingId: string

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, firstDeclarationDetails)
    expect(res.trackingId).toBeDefined()
    trackingId = res.trackingId!
  })

  await test.step('Declare a second, similar declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, secondDeclarationDetails, ActionType.DECLARE)
  })

  await test.step('Open the second declaration from the Potential duplicate workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, secondDeclarationName)
  })

  await test.step('The second declaration is flagged as a potential duplicate of the first', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(
      page.getByText(`Potential duplicate of record ${trackingId}`)
    ).toBeVisible()
  })
})

test('1.2. Standard checks for duplicate record do not flag dissimilar declarations as duplicates', async ({
  page
}) => {
  const firstDeclarationDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 90)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 25)),
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const secondDeclarationDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 10)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 35)),
    'mother.idType': 'NONE',
    'mother.nid': null
  }

  const secondDeclarationName = formatV2ChildName(secondDeclarationDetails)
  let trackingId: string

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, firstDeclarationDetails)
    expect(res.registrationNumber).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      token,
      secondDeclarationDetails,
      ActionType.DECLARE
    )
    trackingId = res.trackingId!
  })

  await test.step('The second declaration is not flagged as a potential duplicate', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await searchFromSearchBar(page, trackingId, false)
    await openRecordByTitle(page, secondDeclarationName)
    await expect(page.getByText(/Potential duplicate of record/)).toBeHidden()
  })
})

test('1.3. Two births from the same mother within 9 months of each other are flagged as a potential duplicate', async ({
  page
}) => {
  const motherFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const motherSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const motherDob = isoDate(subYears(new Date(), 30))
  const motherNid = faker.string.numeric(10)

  const firstDeclarationDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 200)),
    'mother.name': { firstname: motherFirstName, surname: motherSurname },
    'mother.dob': motherDob,
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': motherNid
  }

  const secondDeclarationDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 140)),
    'mother.name': {
      firstname: withOneLetterChanged(motherFirstName),
      surname: withOneLetterChanged(motherSurname)
    },
    'mother.dob': motherDob,
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': motherNid
  }

  const secondDeclarationName = formatV2ChildName(secondDeclarationDetails)
  let trackingId: string

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, firstDeclarationDetails)
    expect(res.trackingId).toBeDefined()
    trackingId = res.trackingId!
  })

  await test.step('Declare a second child of the same mother, within 9 months', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, secondDeclarationDetails, ActionType.DECLARE)
  })

  await test.step('Open the second declaration from the Potential duplicate workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, secondDeclarationName)
  })

  await test.step('The second declaration is flagged as a potential duplicate of the first', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(
      page.getByText(`Potential duplicate of record ${trackingId}`)
    ).toBeVisible()
  })
})

test('1.4. A child re-declared with an increased or decreased age is flagged as a potential duplicate', async ({
  page
}) => {
  const childFirstName = faker.person.firstName('female')
  const childSurname = faker.person.lastName('female')
  const childGender = 'Female'
  const childName = formatName({
    firstNames: childFirstName,
    familyName: childSurname
  })

  const motherFirstName = fakerNameAtLeast(4, () =>
    faker.person.firstName('female')
  )
  const motherSurname = fakerNameAtLeast(4, () =>
    faker.person.lastName('female')
  )
  const motherDob = toDateParts(subYears(new Date(), 32))
  const motherNid = faker.string.numeric(10)

  const firstChildAnchor = subDays(new Date(), 20)
  const firstChildDob = toDateParts(firstChildAnchor)
  const secondChildDob = toDateParts(subYears(firstChildAnchor, 2))

  async function fillMotherAndFatherThenSubmit(
    motherFirstname: string,
    motherSurnameToFill: string
  ) {
    await page.locator('#firstname').fill(motherFirstname)
    await page.locator('#surname').fill(motherSurnameToFill)
    await fillDate(page, motherDob)
    await page.locator('#mother____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#mother____nid').fill(motherNid)
    await page.locator('#country').click()
    await page.locator('#country input').fill('Far')
    await page
      .locator('#country')
      .getByText('Farajaland', { exact: true })
      .click()

    await page.locator('#village').click()
    await page.getByText('Klow', { exact: true }).click()
    await continueForm(page)

    await page.locator('#firstname').fill(faker.person.firstName('male'))
    await page.locator('#surname').fill(faker.person.lastName('male'))
    await fillDate(page, toDateParts(subYears(new Date(), 35)))
    await page.locator('#father____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#father____nationality').click()
    await page.getByText('Gabon', { exact: true }).click()
    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await goToSection(page, 'review')

    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()
  }

  await test.step('Register the first declaration (same child, first age)', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await openBirthDeclaration(page)

    await page.locator('#firstname').fill(childFirstName)
    await page.locator('#surname').fill(childSurname)
    await page.locator('#child____gender').click()
    await page.getByText(childGender, { exact: true }).click()
    await fillDate(page, firstChildDob)
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#child____birthLocation')
      .fill('Klow Village Hospital'.slice(0, 3))
    await page.getByText('Klow Village Hospital').click()
    await continueForm(page)

    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill(faker.internet.email())
    await continueForm(page)

    await fillMotherAndFatherThenSubmit(motherFirstName, motherSurname)

    await triggerDeclarationAction(page, 'Register')
  })

  await test.step('Declare the same child again with a different age', async () => {
    await openBirthDeclaration(page)

    await page.locator('#firstname').fill(childFirstName)
    await page.locator('#surname').fill(childSurname)
    await page.locator('#child____gender').click()
    await page.getByText(childGender, { exact: true }).click()
    await fillDate(page, secondChildDob)

    await page
      .locator('#child____reason')
      .fill('Distance from registration office')
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#child____birthLocation')
      .fill('Klow Village Hospital'.slice(0, 3))
    await page.getByText('Klow Village Hospital').click()
    await continueForm(page)

    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill(faker.internet.email())
    await continueForm(page)

    await fillMotherAndFatherThenSubmit(
      withOneLetterChanged(motherFirstName),
      withOneLetterChanged(motherSurname)
    )

    await triggerDeclarationAction(page, 'Declare')
  })

  await test.step('Open the second declaration from the Potential duplicate workqueue', async () => {
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, childName)
  })

  await test.step('The second declaration is flagged as a potential duplicate of the first', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(page.getByText(/Potential duplicate of record/)).toBeVisible()
  })
})
