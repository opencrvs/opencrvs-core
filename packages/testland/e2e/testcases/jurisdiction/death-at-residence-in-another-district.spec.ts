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
import { test, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  continueForm,
  drawSignature,
  getRandomDate,
  goToSection,
  login,
  searchFromSearchBar,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'

/**
 * Picks an option out of an administrative area dropdown. The options are
 * matched inside the open dropdown: a registrar's own province and district are
 * pre-filled, so their names also appear in the closed select.
 */
async function selectAdministrativeArea(page: Page, id: string, name: string) {
  await page.locator(`#${id}`).click()
  await page
    .locator('li[id^="locationOption"]')
    .filter({ hasText: new RegExp(`^${name}$`) })
    .click()
}

/**
 * A death at the deceased's usual place of residence belongs to the district
 * that residence is in, whoever declares it. Declaring it from a district it
 * did not happen in is what tells the two apart: the record has to land where
 * the deceased lived, not at the office that filed it.
 */
test.describe.serial('Death at a usual residence in another district', () => {
  let page: Page

  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      gender: 'Female',
      dob: getRandomDate(75, 200),
      idType: 'None',
      maritalStatus: 'Single',
      // Isamba, not the Ibombo district the declaring registrar works in
      address: {
        province: 'Central',
        district: 'Isamba',
        village: 'Mbula'
      }
    },
    eventDetails: {
      date: getRandomDate(0, 20),
      placeOfDeath: "Deceased's usual place of residence"
    },
    informant: {
      relation: 'Spouse',
      email: faker.internet.email()
    },
    spouse: {
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      dob: getRandomDate(50, 200),
      idType: 'None'
    },
    review: {
      comment: 'Died at home, reported to the Ibombo office'
    }
  }

  const deceasedName =
    declaration.deceased.name.firstname +
    ' ' +
    declaration.deceased.name.surname

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Ibombo registrar starts a death declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Fill deceased details, with a usual residence in Isamba', async () => {
    await page.locator('#firstname').fill(declaration.deceased.name.firstname)
    await page.locator('#surname').fill(declaration.deceased.name.surname)

    await page.locator('#deceased____gender').click()
    await page.getByText(declaration.deceased.gender, { exact: true }).click()

    await page.getByPlaceholder('dd').fill(declaration.deceased.dob.dd)
    await page.getByPlaceholder('mm').fill(declaration.deceased.dob.mm)
    await page.getByPlaceholder('yyyy').fill(declaration.deceased.dob.yyyy)

    await page.locator('#deceased____idType').click()
    await page.getByText(declaration.deceased.idType, { exact: true }).click()

    await page.locator('#deceased____maritalStatus').click()
    await page
      .getByText(declaration.deceased.maritalStatus, { exact: true })
      .click()

    await selectAdministrativeArea(
      page,
      'province',
      declaration.deceased.address.province
    )
    await selectAdministrativeArea(
      page,
      'district',
      declaration.deceased.address.district
    )
    await selectAdministrativeArea(
      page,
      'village',
      declaration.deceased.address.village
    )

    await continueForm(page)
  })

  test('Record the death as having happened at that residence', async () => {
    await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
    await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
    await page.getByPlaceholder('yyyy').fill(declaration.eventDetails.date.yyyy)

    await page.locator('#eventDetails____placeOfDeath').click()
    await page
      .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
      .click()

    await continueForm(page)
  })

  test('Fill informant details', async () => {
    await page.locator('#informant____relation').click()
    await page
      .getByText(declaration.informant.relation, { exact: true })
      .click()

    // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased
    await page.waitForTimeout(500)

    await page.locator('#informant____email').fill(declaration.informant.email)

    await continueForm(page)
  })

  test('Fill spouse details', async () => {
    await page.locator('#firstname').fill(declaration.spouse.name.firstname)
    await page.locator('#surname').fill(declaration.spouse.name.surname)

    await page.getByPlaceholder('dd').fill(declaration.spouse.dob.dd)
    await page.getByPlaceholder('mm').fill(declaration.spouse.dob.mm)
    await page.getByPlaceholder('yyyy').fill(declaration.spouse.dob.yyyy)

    await page.locator('#spouse____idType').click()
    await page.getByText(declaration.spouse.idType, { exact: true }).click()

    await continueForm(page)
  })

  test('Sign the declaration', async () => {
    await goToSection(page, 'review')

    await page.locator('#review____comment').fill(declaration.review.comment)
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()
  })

  test('Declare', async () => {
    await triggerDeclarationAction(page, 'Declare')
  })

  test('The Isamba registrar finds the declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR_ISAMBA)

    await searchFromSearchBar(page, deceasedName)
  })
})
