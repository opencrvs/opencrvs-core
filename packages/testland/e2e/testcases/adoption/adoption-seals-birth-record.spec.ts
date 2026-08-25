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
import {
  drawSignature,
  getRandomDate,
  getToken,
  login,
  REDACTED_RECORD_TITLE,
  searchFromSearchBar,
  triggerDeclarationAction,
  uploadImage
} from '@e2e/support/helpers'
import { ensureAssignedToUser } from '@e2e/support/utils'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { fillDate, formatV2ChildName } from '@e2e/support/birth/helpers'

test('Registering an adoption seals the original birth record', async ({
  browser
}) => {
  test.setTimeout(180_000)
  const page = await browser.newPage()

  const child = {
    firstNames: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const adoptionTitle = `${child.firstNames} ${child.surname}`

  let birthChildName: string
  let birthRegistrationNumber: string

  await test.step('A birth record is registered (this is the record adoption will seal)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)

    birthChildName = formatV2ChildName(res.declaration as Declaration)
    birthRegistrationNumber = res.registrationNumber!

    expect(birthRegistrationNumber).toBeTruthy()
  })

  await test.step('Registrar starts a new adoption declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.click('#header-new-event')
    await page.getByLabel('Adoption').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Introduction page
    await expect(
      page.getByText('I am going to help you make a declaration of adoption.')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step("Fill the child's identity at birth", async () => {
    await expect(page.getByText("Adopted child's details")).toBeVisible()

    await page.locator('#firstname').fill(child.firstNames)
    await page.locator('#surname').fill(child.surname)
    await fillDate(page, getRandomDate(1, 300))
  })

  await test.step('Looking up a non-existent BRN shows no match', async () => {
    await page.locator('#search').fill('NOTAREALBRN1')
    await page.getByRole('button', { name: 'Search', exact: true }).click()

    await expect(page.getByTestId('search-input-error')).toContainText(
      'No birth record found with this BRN'
    )
  })

  await test.step("Looking up the child's original birth record by BRN links it", async () => {
    // No result was found above, so the input is still editable directly -
    // no need to go through the "Clear" confirmation (only shown once a
    // record has actually been linked).
    await page.locator('#search').fill(birthRegistrationNumber)
    await page.getByRole('button', { name: 'Search', exact: true }).click()

    await expect(page.getByTestId('search-input-error')).toContainText(
      'Birth record found'
    )

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill the adoption order details', async () => {
    await expect(page.getByText('Adoption order details')).toBeVisible()

    await page
      .locator('#adoptionOrder____reference')
      .fill(faker.string.alphanumeric(10).toUpperCase())
    await page
      .locator('#adoptionOrder____issuingAuthority')
      .fill('Klow Family Court')
    await fillDate(page, getRandomDate(0, 30))

    // Post-adoption name change fields are optional - left blank.
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill adoptive parent 1 details', async () => {
    await expect(page.getByText('Adoptive parent 1 details')).toBeVisible()

    await page.locator('#firstname').fill(faker.person.firstName())
    await page.locator('#surname').fill(faker.person.lastName())
    await page
      .locator('#adoptiveMother____idNumber')
      .fill(faker.string.numeric(10))
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Skip adoptive parent 2 (optional)', async () => {
    await expect(page.getByText('Adoptive parent 2 details')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Upload the adoption court order', async () => {
    await expect(page.getByText('Upload supporting documents')).toBeVisible()

    await uploadImage(
      page,
      page.locator('button[name="documents____courtOrderCopy"]')
    )
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Sign and declare the adoption', async () => {
    await page
      .locator('#review____comment')
      .fill('Adoption verified against the court order.')
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await triggerDeclarationAction(page, 'Declare')
  })

  await test.step('Registrar general registers the adoption', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await searchFromSearchBar(page, adoptionTitle)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await triggerDeclarationAction(page, 'Register')
  })

  await test.step('The original birth record is now sealed', async () => {
    // Sealing strips the declaration from the search index, so the birth
    // record is still found by the child's name but listed without one.
    await searchFromSearchBar(page, birthChildName, true, REDACTED_RECORD_TITLE)
    await expect(page.getByTestId('flags-value')).toContainText('Sealed')
    await expect(page.getByText('Record is protected')).toBeVisible()
  })
})
