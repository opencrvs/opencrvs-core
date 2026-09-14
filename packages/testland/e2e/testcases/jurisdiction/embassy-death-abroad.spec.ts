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
import { test, expect, type Page } from '@playwright/test'
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
 * An embassy official records deaths that happened abroad, where there is no
 * administrative area to place the record in. Such a record belongs to the
 * office that declared it — not to the home district of the deceased, which is
 * outside the jurisdiction of that office and would take the record out of its
 * own author's hands.
 *
 * @see https://github.com/opencrvs/opencrvs-core/issues/13651
 */
test.describe.serial('Death abroad declared by an embassy official', () => {
  let page: Page

  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      gender: 'Male',
      dob: getRandomDate(75, 200),
      idType: 'None',
      maritalStatus: 'Single',
      // Home in Farajaland, far from the embassy's own office
      address: {
        province: 'Central',
        district: 'Ibombo',
        village: 'Klow'
      }
    },
    eventDetails: {
      date: getRandomDate(0, 20),
      placeOfDeath: 'Other',
      deathLocationOther: {
        country: 'Guam',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city()
      }
    },
    informant: {
      relation: 'Spouse',
      email: faker.internet.email()
    },
    spouse: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      dob: getRandomDate(50, 200),
      idType: 'None'
    },
    review: {
      comment: 'Death occurred abroad, reported to the embassy'
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

  test('Embassy official starts a death declaration', async () => {
    await login(page, CREDENTIALS.EMBASSY_OFFICIAL)

    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Fill deceased details, with a usual residence in Farajaland', async () => {
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

    await page.locator('#province').click()
    await page
      .getByText(declaration.deceased.address.province, { exact: true })
      .click()
    await page.locator('#district').click()
    await page
      .getByText(declaration.deceased.address.district, { exact: true })
      .click()
    await page.locator('#village').click()
    await page
      .getByText(declaration.deceased.address.village, { exact: true })
      .click()

    await continueForm(page)
  })

  test('Record the death as having happened in a foreign country', async () => {
    await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
    await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
    await page.getByPlaceholder('yyyy').fill(declaration.eventDetails.date.yyyy)

    await page.locator('#eventDetails____placeOfDeath').click()
    await page
      .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
      .click()

    await page.locator('#country').click()
    await page
      .getByText(declaration.eventDetails.deathLocationOther.country, {
        exact: true
      })
      .click()

    await page
      .locator('#state')
      .fill(declaration.eventDetails.deathLocationOther.state)
    await page
      .locator('#district2')
      .fill(declaration.eventDetails.deathLocationOther.district)
    await page
      .locator('#cityOrTown')
      .fill(declaration.eventDetails.deathLocationOther.town)

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

    await expect(page.getByText('Farajaland CRS')).toBeVisible()
  })

  test('The declaration is in the embassy official`s own workqueue', async () => {
    await page.getByText('Recent').click()

    await expect(page.getByRole('button', { name: deceasedName })).toBeVisible()
  })

  test('The embassy official can find the declaration by searching for it', async () => {
    await searchFromSearchBar(page, deceasedName)
  })
})
