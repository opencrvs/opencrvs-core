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
import {
  auditRecord,
  getToken,
  login,
  logout,
  uploadImageToSection
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import {
  createDeclaration,
  Declaration,
  getPlaceOfBirth
} from '@e2e/support/test-data/birth-declaration'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  formatV2ChildName,
  getAdministrativeAreas,
  getIdByName
} from '@e2e/support/birth/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  waitForCorrectionAction
} from '@e2e/support/utils'
import { AddressType } from '@opencrvs/toolkit/events'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test.describe.serial('Correct record - Change ages', () => {
  let declaration: Declaration
  let trackingId = ''
  let eventId = ''
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  const motherAgeBefore = '28'
  const motherAgeAfter = '29'
  const informantAgeBefore = '16'
  const informantAgeAfter = '22'

  test('Shortcut declaration', async () => {
    let token = await getToken(CREDENTIALS.REGISTRAR)

    const administrativeAreas = await getAdministrativeAreas(token)
    const province = getIdByName(administrativeAreas, 'Central')
    const district = getIdByName(administrativeAreas, 'Ibombo')
    const village = getIdByName(administrativeAreas, 'Klow')

    if (!province || !district || !village) {
      throw new Error('Province, district or village not found')
    }

    const childDob = new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0]

    const payload = {
      'informant.relation': 'BROTHER',
      'informant.email': 'brothers@email.com',
      'informant.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'informant.dobUnknown': true,
      'informant.age': {
        age: Number.parseInt(informantAgeBefore),
        asOfDateRef: 'child.dob'
      },
      'informant.nationality': 'FAR',
      'informant.idType': 'NATIONAL_ID',
      'informant.nid': faker.string.numeric(10),
      'informant.address': {
        country: 'FAR',
        administrativeArea: village,
        addressType: AddressType.DOMESTIC
      },
      'father.detailsNotAvailable': true,
      'father.reason': 'Father is missing.',
      'mother.dobUnknown': true,
      'mother.age': {
        age: Number.parseInt(motherAgeBefore),
        asOfDateRef: 'child.dob'
      },
      ...(await getPlaceOfBirth('PRIVATE_HOME', token)),
      'mother.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'mother.nationality': 'FAR',
      'mother.idType': 'NATIONAL_ID',
      'mother.nid': faker.string.numeric(10),
      'mother.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: village
      },
      'child.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'child.gender': 'female',
      'child.dob': childDob
    }

    const res = await createDeclaration(token, payload)

    expect(res).toEqual(
      expect.objectContaining({
        trackingId: expect.any(String)
      })
    )
    trackingId = res.trackingId!
    eventId = res.eventId
    token = await getToken(CREDENTIALS.REGISTRAR)
    declaration = res.declaration
  })

  test('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  test('Ready to correct record > record audit', async () => {
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await selectAction(page, 'Correct')
  })

  test('Correction requester: legal guardian', async () => {
    await page.locator('#requester____type').click()
    await page.getByText('Legal Guardian', { exact: true }).click()
    await page.locator('#reason____option').click()
    await page
      .getByText('Informant provided incorrect information (Material error)', {
        exact: true
      })
      .click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Verify identity', async () => {
    await page.getByRole('button', { name: 'Verified' }).click()
  })

  test('Upload supporting documents', async () => {
    await expectInUrl(page, 'correction')
    await expectInUrl(page, 'onboarding/documents')

    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()

    const imageUploadSectionTitles = ['Affidavit', 'Court Document', 'Other']

    for (const sectionTitle of imageUploadSectionTitles) {
      await uploadImageToSection({
        page,
        sectionLocator: page.locator('#corrector_form'),
        sectionTitle,
        buttonLocator: page.getByRole('button', { name: 'Upload' })
      })
    }

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Correction fee', async () => {
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())

    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(page, 'correction')
    await expectInUrl(page, 'review')
  })

  test('Change informant age', async () => {
    await page.getByTestId('change-button-informant.age').click()

    await page.getByTestId('age__informant____age').fill(informantAgeAfter)

    await page
      .getByRole('button', { name: 'Go to review', exact: true })
      .click()

    await expect(
      page.getByTestId('informant.age-value').getByRole('deletion')
    ).toHaveText(informantAgeBefore)

    await expect(
      page.getByTestId('informant.age-value').getByText(informantAgeAfter)
    ).toBeVisible()
  })

  test('Change mother address to international', async () => {
    await page.getByTestId('change-button-mother.address').click()
    await page.getByTestId('location__country').click()
    await page.getByText('Ethiopia').click()
    await page
      .getByRole('button', { name: 'Go to review', exact: true })
      .click()
    await expect(page.getByTestId('mother.address-value')).toHaveText(
      'State is required'
    )

    await page.getByTestId('change-button-mother.address').click()

    await page.getByTestId('text__state').fill('Oromia')
    await page
      .getByRole('button', { name: 'Go to review', exact: true })
      .click()
    await expect(page.getByTestId('mother.address-value')).toHaveText(
      'District is required'
    )

    await page.getByTestId('change-button-mother.address').click()
    await page.getByTestId('text__district2').fill('Woreda')
    await page
      .getByRole('button', { name: 'Go to review', exact: true })
      .click()

    await expect(page.getByTestId('mother.address-value')).toHaveText(
      'FarajalandCentralIbomboKlowEthiopiaOromiaWoreda'
    )
  })

  test('Change mother age', async () => {
    await page.getByTestId('change-button-mother.age').click()

    await page.getByTestId('age__mother____age').fill(motherAgeAfter)

    await page
      .getByRole('button', { name: 'Go to review', exact: true })
      .click()

    await expect(
      page.getByTestId('mother.age-value').getByRole('deletion')
    ).toHaveText(motherAgeBefore)

    await expect(
      page.getByTestId('mother.age-value').getByText(motherAgeAfter)
    ).toBeVisible()
  })

  test('Correction summary', async () => {
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expectInUrl(page, 'correction')
    await expectInUrl(page, 'summary')

    await expect(page.getByText("Father's details")).not.toBeVisible()
    await expect(page.getByText("Child's details")).not.toBeVisible()
    await expect(page.getByText("Mother's details")).toBeVisible()

    await page.pause()

    await expect(
      page.getByText(
        'Age of mother (at the time of event)' +
          motherAgeBefore +
          motherAgeAfter
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residenceFarajalandCentralIbomboKlowEthiopiaOromiaWoreda'
      )
    ).toBeVisible()

    await expect(page.getByText("Informant's details")).toBeVisible()
    await expect(
      page.getByText(
        'Age of informant (at the time of event)' +
          informantAgeBefore +
          informantAgeAfter
      )
    ).toBeVisible()
  })

  test('Submit correction request', async () => {
    await page
      .getByRole('button', { name: 'Submit correction request' })
      .click()

    await page.getByRole('button', { name: 'Confirm' }).click()
  })

  test('Logout', async () => {
    await logout(page)
  })

  test('Login as Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('Find the event in the "Pending corrections" workqueue', async () => {
    await page.getByRole('button', { name: 'Pending corrections' }).click()

    await openRecordByTitle(page, formatV2ChildName(declaration))
  })

  test('Approve correction request', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review correction request')
    await page.getByRole('button', { name: 'Approve', exact: true }).click()

    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })
  })

  test('View record', async () => {
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Record', exact: true }).click()

    await expect(
      page.getByTestId('informant.age-value').getByText(informantAgeAfter)
    ).toBeVisible()

    await expect(
      page.getByTestId('mother.age-value').getByText(motherAgeAfter)
    ).toBeVisible()
  })
})
