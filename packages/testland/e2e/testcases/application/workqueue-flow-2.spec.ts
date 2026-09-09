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
import { faker } from '@faker-js/faker'
import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  goToSection,
  login,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import {
  assertRecordInWorkqueue,
  fillDate,
  generateBirthInputs
} from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

// HO Notifies => Registrar Registers

test.describe.serial('2. Workqueue flow - 2', () => {
  let page: Page
  const declaration = generateBirthInputs()
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('2.1 Notify by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('2.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
      await page
        .locator('#child____birthLocation')
        .fill(declaration.birthLocation.facility.slice(0, 3))
      await page.getByText(declaration.birthLocation.facility).click()
    })

    test('2.1.2 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('2.1.3 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('2.1.4 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')
    })

    test('2.1.5 Verify workqueue', async () => {
      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Pending updates', exists: false }
        ]
      })
    })
  })

  test.describe('2.2 Register by Registrar', async () => {
    test('2.2.1 Verify workqueue', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: true },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    test('2.2.2 Go to Edit', async () => {
      await page.getByText('Notifications').click()
      await openRecordByTitle(page, formatName(declaration.child.name))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Edit')

      await page
        .getByTestId('accordion-Accordion_informant')
        .getByRole('button', { name: 'Change all' })
        .click()
    })

    test('2.2.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test("2.2.4 Fill mother's details", async () => {
      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____nid')
        .fill(declaration.mother.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()
      await page.locator('#village').click()
      await page
        .getByText(declaration.mother.address.village, { exact: true })
        .click()

      await continueForm(page)
    })

    test("2.2.5 Fill father's details", async () => {
      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await fillDate(page, declaration.father.birthDate)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____nid')
        .fill(declaration.father.identifier.id)

      await page.locator('#father____nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.locator('#father____addressSameAs_YES').click()
    })

    test('2.2.6 Register with edits', async () => {
      await goToSection(page, 'review')
      await triggerDeclarationAction(page, 'Register with edits')

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: true },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })

  test('2.3 HO can not see the registered record', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL, true)

    await assertRecordInWorkqueue({
      page,
      name: formatName(declaration.child.name),
      workqueues: [
        { title: 'Assigned to you', exists: false },
        { title: 'Recent', exists: false },
        { title: 'Pending updates', exists: false }
      ]
    })
  })

  test('2.4 Registration Officer can see the record in Pending certification', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await assertRecordInWorkqueue({
      page,
      name: formatName(declaration.child.name),
      workqueues: [
        { title: 'Assigned to you', exists: false },
        { title: 'Recent', exists: false },
        { title: 'Notifications', exists: false },
        { title: 'Pending validation', exists: false },
        { title: 'Pending updates', exists: false },
        { title: 'Pending approval', exists: false },
        { title: 'Escalated', exists: false },
        { title: 'Pending external validation', exists: false },
        { title: 'Pending certification', exists: true },
        { title: 'Pending issuance', exists: false }
      ]
    })
  })
})
