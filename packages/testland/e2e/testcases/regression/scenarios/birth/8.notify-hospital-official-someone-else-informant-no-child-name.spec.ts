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
// Regression test data - Birth, Declaration Number 8:
// Sent by a Hospital Official as an incomplete NOTIFY - the child's page is
// left entirely blank (no name, sex, attendant, type of birth, weight or
// place of delivery at all), "Someone else" informant with the full
// extra-fields flow and a free-text relationship description, mother and
// father both available with an unstated marital status. Since there's no
// child name to search the workqueue by, the created event's id is
// captured directly from the event.create network response instead of
// using openRecordByTitle.
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  login,
  continueForm,
  goToSection,
  drawSignature,
  triggerDeclarationAction,
  formatName,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  expectRowValue,
  switchEventTab
} from '../../../../helpers'
import { CREDENTIALS, CLIENT_URL } from '../../../../constants'
import { selectLocationOption } from '../../../../utils'
import { openBirthDeclaration, fillDate } from '../../../birth/helpers'
import { selectDropdownOption } from './helpers'

test('8. Notify a birth as a Hospital Official - no child\'s name at all, "Someone else" informant, mother and father both available with unstated marital status', async ({
  page
}) => {
  const informantOtherRelation = 'Family friend'
  const informantFirstName = faker.person.firstName()
  const informantSurname = faker.person.lastName()
  const motherFirstName = faker.person.firstName('female')
  const motherSurname = faker.person.lastName('female')
  const fatherFirstName = faker.person.firstName('male')
  const fatherSurname = faker.person.lastName('male')

  const informantDob = getRandomDate(18, 3650)

  const informantEmail = faker.internet.email()

  let eventId: string

  await test.step('Log in as the Hospital Official and start a birth declaration', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL_OTHER)

    // There's no child name to search the workqueue by later, so the
    // created event's id is captured directly from the event.create
    // response instead - `waitForResponse` (rather than a fire-and-forget
    // `page.on('response', ...)` listener) so nothing further in the test
    // can race ahead of the id actually being captured.
    const eventCreated = page.waitForResponse(
      (res) =>
        res.status() === 200 && res.url().includes('/api/events/event.create')
    )

    await openBirthDeclaration(page)

    const eventCreatedResponse = await eventCreated
    // tRPC batches responses into an array (?batch=1 in the request URL),
    // so the payload is wrapped in an extra `[0]` compared to a plain
    // single-call response.
    const [{ result }] = await eventCreatedResponse.json()
    eventId = result.data.json.id as string
  })

  await test.step("Leave the child's details entirely blank", async () => {
    await continueForm(page)
  })

  await test.step("Fill the informant's details (Someone else)", async () => {
    await page.locator('#informant____relation').click()
    await selectDropdownOption(page, 'Someone else')
    await page
      .locator('#informant____other____relation')
      .fill(informantOtherRelation)
    await page.locator('#informant____email').fill(informantEmail)

    await page.locator('#firstname').fill(informantFirstName)
    await page.locator('#surname').fill(informantSurname)
    await fillDate(page, informantDob)

    await page.locator('#informant____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#informant____idType').click()
    await selectDropdownOption(page, 'None')

    // Usual place of residence isn't specified in the sheet - a simple
    // Farajaland address.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await continueForm(page)
  })

  await test.step("Fill the mother's details", async () => {
    await page.locator('#firstname').fill(motherFirstName)
    await page.locator('#surname').fill(motherSurname)
    // Date of birth doesn't render at all for this role (unlike address,
    // which does) - a secured field that's genuinely inaccessible here,
    // not just left blank by choice.

    await page.locator('#mother____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#mother____idType').click()
    await selectDropdownOption(page, 'None')

    // Usual place of residence isn't specified in the sheet - a simple
    // Farajaland address.
    await page.locator('#province').click()
    await selectLocationOption(page, 'Central')
    await page.locator('#district').click()
    await selectLocationOption(page, 'Ibombo')
    await page.locator('#village').click()
    await selectLocationOption(page, 'Klow')

    await page.locator('#mother____maritalStatus').click()
    await selectDropdownOption(page, 'Not stated')

    await continueForm(page)
  })

  await test.step("Fill the father's details", async () => {
    await page.locator('#firstname').fill(fatherFirstName)
    await page.locator('#surname').fill(fatherSurname)
    // Date of birth doesn't render at all for this role (see mother's step).

    await page.locator('#father____nationality').click()
    await selectDropdownOption(page, 'Farajaland')

    await page.locator('#father____idType').click()
    await selectDropdownOption(page, 'None')

    // Same as mother's residence - simplest option for an unspecified field.
    await page.getByLabel('Yes', { exact: true }).check()

    await page.locator('#father____maritalStatus').click()
    await selectDropdownOption(page, 'Not stated')

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Add the review comment and signature, then notify', async () => {
    await goToSection(page, 'review')

    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Open the notified event directly by its captured id', async () => {
    await page.goto(`${CLIENT_URL}/events/${eventId}`)
  })

  await test.step('The declaration status is Notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified', {
      timeout: 30_000
    })
  })

  await test.step('The record matches the data that was filled in', async () => {
    await switchEventTab(page, 'Record')

    await expectRowValue(page, 'informant.relation', 'Someone else')
    await expectRowValue(
      page,
      'informant.other.relation',
      informantOtherRelation
    )
    await expectRowValue(page, 'informant.email', informantEmail)
    await expectRowValue(
      page,
      'informant.name',
      formatName({
        firstNames: informantFirstName,
        familyName: informantSurname
      })
    )
    await expectRowValue(
      page,
      'informant.dob',
      formatDateObjectTo_dMMMMyyyy(informantDob)
    )
    await expectRowValue(page, 'informant.nationality', 'Farajaland')
    await expectRowValue(page, 'informant.idType', 'None')
    await expectRowValue(page, 'informant.address', 'Klow')

    await expectRowValue(
      page,
      'mother.name',
      formatName({ firstNames: motherFirstName, familyName: motherSurname })
    )
    await expectRowValue(page, 'mother.nationality', 'Farajaland')
    await expectRowValue(page, 'mother.idType', 'None')
    await expectRowValue(page, 'mother.maritalStatus', 'Not stated')
    await expectRowValue(page, 'mother.address', 'Klow')

    await expectRowValue(
      page,
      'father.name',
      formatName({ firstNames: fatherFirstName, familyName: fatherSurname })
    )
    await expectRowValue(page, 'father.nationality', 'Farajaland')
    await expectRowValue(page, 'father.idType', 'None')
    await expectRowValue(page, 'father.maritalStatus', 'Not stated')
    await expectRowValue(page, 'father.addressSameAs', 'Yes')
  })
})
