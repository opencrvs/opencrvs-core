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
import { test } from '@playwright/test'
import {
  continueForm,
  formatName,
  getToken,
  login,
  triggerDeclarationAction,
  waitForActionResponses,
  signReview
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import {
  assertRecordInWorkqueue,
  fillDate,
  generateBirthInputs
} from '@e2e/support/birth/helpers'
import {
  getRowByTitle,
  openRecordByTitle
} from '@e2e/support/print-certificate/birth/helpers'
import { notifyChildDetailsViaApi } from '@e2e/support/test-data/api-actions'

// HO Notifies => RO Validates => Registrar Registers => Registrar Prints
test('1. Workqueue flow - 1', async ({ page }) => {
  test.setTimeout(360_000)

  const declaration = generateBirthInputs()

  await test.step('1.1 Notify by HO', async () => {
    await test.step('1.1.1 Notify child details via API', async () => {
      await notifyChildDetailsViaApi(
        await getToken(CREDENTIALS.HOSPITAL_OFFICIAL),
        declaration
      )
    })

    await test.step('1.1.2 Login', async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    })

    await test.step('1.1.3 Verify workqueue', async () => {
      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true }
        ]
      })
    })
  })

  await test.step('1.2 Declare and validate by Registration Officer', async () => {
    await test.step('1.2.1 Verify workqueue', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: true },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    await test.step('1.2.2 Go to Edit', async () => {
      await page.getByText('Notifications').click()
      await openRecordByTitle(page, formatName(declaration.child.name))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await selectAction(page, 'Edit')

      await page
        .getByTestId('accordion-Accordion_informant')
        .getByRole('button', { name: 'Change all' })
        .click()
    })
    await test.step('1.2.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    await test.step("1.2.4 Fill mother's details", async () => {
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

    await test.step("1.2.5 Fill father's details", async () => {
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
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    await test.step('1.2.6 Declare with edits', async () => {
      await signReview(page)
      await triggerDeclarationAction(page, 'Declare with edits')

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })

  await test.step('1.3 HO can not see the validated record', async () => {
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

  await test.step('1.4 Register by Registrar', async () => {
    await test.step('1.4.1 Validate workqueue', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: true },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    await test.step('1.4.2 Register', async () => {
      await page.getByText('Pending registration').click()
      await openRecordByTitle(page, formatName(declaration.child.name))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

      await triggerDeclarationAction(page, 'Register')

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

  await test.step('1.5 Print by Registrar', async () => {
    await page
      .getByRole('button', {
        name: 'Pending certification'
      })
      .click()

    await page
      .getByRole('button', {
        name: formatName(declaration.child.name)
      })
      .click()

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await page.goBack()

    const row = getRowByTitle(page, formatName(declaration.child.name))

    await row.getByRole('button', { name: 'Print' }).click()

    await page.locator('#collector____requesterId').click()
    await page
      .getByText('Print and issue to Informant (Mother)', { exact: true })
      .click()

    await continueForm(page)
    await continueForm(page, 'Verified')
    await continueForm(page)
    await page
      .getByRole('button', {
        name: 'Yes, print certificate'
      })
      .click()

    await waitForActionResponses(
      page,
      ['event.actions.printCertificate'],
      async () =>
        await page
          .getByRole('button', {
            name: 'Print',
            exact: true
          })
          .click()
    )

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
        { title: 'Pending certification', exists: false },
        { title: 'Pending issuance', exists: false }
      ]
    })
  })

  await test.step('1.6 HO can not see the registered record', async () => {
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

  await test.step("1.7 Registration Officer can't see the record", async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER, true)

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
        { title: 'Pending certification', exists: false },
        { title: 'Pending issuance', exists: false }
      ]
    })
  })
})
