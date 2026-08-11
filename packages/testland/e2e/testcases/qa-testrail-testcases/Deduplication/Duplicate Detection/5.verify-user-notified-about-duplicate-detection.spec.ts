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
// TestRail Test Case ID: 2481---https://ocrvs.testrail.io/index.php?/cases/view/2481
import { expect, test, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { format, subDays, addDays, subYears } from 'date-fns'
import { ActionType } from '@opencrvs/toolkit/events'
import {
  continueForm,
  drawSignature,
  getToken,
  goToSection,
  login,
  triggerDeclarationAction
} from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration as createBirthDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import { createDeclaration as createDeathDeclaration } from '../../../test-data/death-declaration'
import { openBirthDeclaration, fillDate } from '../../../birth/helpers'
import { ensureAssignedToUser } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'

const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')
const toDateParts = (date: Date) => ({
  dd: format(date, 'dd'),
  mm: format(date, 'MM'),
  yyyy: format(date, 'yyyy')
})

const DUPLICATE_TOAST_TEXT =
  /is a potential duplicate\. Record is ready for review\./

const formatDeceasedName = (obj: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) => `${obj['deceased.name'].firstname} ${obj['deceased.name'].surname}`

async function declareMatchingBirthViaUi(
  page: Page,
  match: {
    childFirstName: string
    childSurname: string
    childDob: { dd: string; mm: string; yyyy: string }
    motherFirstName: string
    motherSurname: string
    motherDob: { dd: string; mm: string; yyyy: string }
    motherNid: string
  }
) {
  await openBirthDeclaration(page)

  await page.locator('#firstname').fill(match.childFirstName)
  await page.locator('#surname').fill(match.childSurname)
  await page.locator('#child____gender').click()
  await page.getByText('Female', { exact: true }).click()
  await fillDate(page, match.childDob)
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

  await page.locator('#firstname').fill(match.motherFirstName)
  await page.locator('#surname').fill(match.motherSurname)
  await fillDate(page, match.motherDob)
  await page.locator('#mother____idType').click()
  await page.getByText('National ID', { exact: true }).click()
  await page.locator('#mother____nid').fill(match.motherNid)
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

  await triggerDeclarationAction(page, 'Declare')
}

async function declareMatchingBirthAndExpectToast(
  page: Page,
  declaringUser: (typeof CREDENTIALS)[keyof typeof CREDENTIALS]
) {
  const childFirstName = faker.person.firstName('female')
  const childSurname = faker.person.lastName('female')
  const motherFirstName = faker.person.firstName('female')
  const motherSurname = faker.person.lastName('female')
  const motherDobDate = subYears(new Date(), 27)
  const motherNid = faker.string.numeric(10)
  const childDobDate = subDays(new Date(), 30)

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createBirthDeclaration(token, {
      'child.name': { firstname: childFirstName, surname: childSurname },
      'child.dob': isoDate(childDobDate),
      'mother.name': { firstname: motherFirstName, surname: motherSurname },
      'mother.dob': isoDate(motherDobDate),
      'mother.idType': 'NATIONAL_ID',
      'mother.nid': motherNid
    })
    expect(res.trackingId).toBeDefined()
  })

  await test.step('Fill in and declare a second, matching declaration through the UI', async () => {
    await login(page, declaringUser)
    await declareMatchingBirthViaUi(page, {
      childFirstName,
      childSurname,
      childDob: toDateParts(addDays(childDobDate, 3)),
      motherFirstName,
      motherSurname,
      motherDob: toDateParts(motherDobDate),
      motherNid
    })
  })

  await test.step('The potential-duplicate toast is shown', async () => {
    await expect(page.getByText(DUPLICATE_TOAST_TEXT)).toBeVisible()
  })
}

test('5.1. Declaring a matching record through the UI shows the potential-duplicate toast (user with record.review-duplicates)', async ({
  page
}) => {
  await declareMatchingBirthAndExpectToast(page, CREDENTIALS.REGISTRAR)
})

test('5.2. Declaring a matching record through the UI shows the same toast for a user without record.review-duplicates', async ({
  page
}) => {
  await declareMatchingBirthAndExpectToast(
    page,
    CREDENTIALS.REGISTRATION_OFFICER
  )
})

function deathDedupPair() {
  const deceasedFirstName = faker.person.firstName()
  const deceasedSurname = faker.person.lastName()
  const deceasedNid = faker.string.numeric(10)
  const deceasedDob = isoDate(subYears(new Date(), 65))

  const baselineDetails = {
    'deceased.name': { firstname: deceasedFirstName, surname: deceasedSurname },
    'deceased.dob': deceasedDob,
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': deceasedNid,
    'eventDetails.date': isoDate(subDays(new Date(), 20))
  }

  const matchingDetails = {
    'deceased.name': { firstname: deceasedFirstName, surname: deceasedSurname },
    'deceased.dob': deceasedDob,
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': deceasedNid,
    'eventDetails.date': isoDate(addDays(subDays(new Date(), 20), 3))
  }

  return { baselineDetails, matchingDetails }
}

test('5.3. Registering a record that only becomes a duplicate afterwards shows the potential-duplicate toast', async ({
  page
}) => {
  const { baselineDetails, matchingDetails } = deathDedupPair()

  await test.step('Declare a declaration with no existing match yet', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeathDeclaration(
      token,
      matchingDetails,
      ActionType.DECLARE
    )
    expect(res.eventId).toBeDefined()
  })

  await test.step('Declare a second, matching declaration -- this is what creates the collision', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeathDeclaration(
      token,
      baselineDetails,
      ActionType.DECLARE
    )
    expect(res.eventId).toBeDefined()
  })

  await test.step('Register the first declaration from the Pending registration workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, formatDeceasedName(matchingDetails))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await triggerDeclarationAction(page, 'Register')
  })

  await test.step('The potential-duplicate toast is shown', async () => {
    await expect(page.getByText(DUPLICATE_TOAST_TEXT)).toBeVisible()
  })
})
