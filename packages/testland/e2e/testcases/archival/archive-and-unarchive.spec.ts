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
import { test, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import {
  continueForm,
  drawSignature,
  formatName,
  getRandomDate,
  getToken,
  goToSection,
  login,
  logout,
  triggerDeclarationAction,
  searchFromSearchBar
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import {
  assertRecordInWorkqueue,
  fillDate,
  formatV2ChildName,
  generateBirthInputs
} from '../birth/helpers'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '../../utils'
import { ActionType } from '@opencrvs/toolkit/events'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test('Basic Archival flow', async ({ page }) => {
  const declaration = generateBirthInputs({ includeOptionalFields: true })
  await test.step('Login as HO', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
  })

  await test.step('Start creating new birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill child details', async () => {
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

    await page.locator('#child____attendantAtBirth').click()
    await page
      .getByText(declaration.attendantAtBirth, {
        exact: true
      })
      .click()

    await page.locator('#child____birthType').click()
    await page
      .getByText(declaration.birthType, {
        exact: true
      })
      .click()

    await page
      .locator('#child____weightAtBirth')
      .fill(declaration.weightAtBirth.toString())

    await continueForm(page)
  })

  await test.step('Fill informant details', async () => {
    await page.locator('#informant____relation').click()
    await page
      .getByText(declaration.informantType, {
        exact: true
      })
      .click()

    await page.locator('#informant____email').fill(declaration.informantEmail)

    await continueForm(page)
  })

  await test.step("Fill mother's details", async () => {
    await page.locator('#firstname').fill(declaration.mother.name.firstNames)
    await page.locator('#surname').fill(declaration.mother.name.familyName)

    await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
    await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
    await page.getByPlaceholder('yyyy').fill(declaration.mother.birthDate.yyyy)

    await page.locator('#mother____idType').click()
    await page
      .getByText(declaration.mother.identifier.type, { exact: true })
      .click()

    await page.locator('#mother____nid').fill(declaration.mother.identifier.id)

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

    await page.locator('#town').fill(declaration.mother.address.town)
    await page
      .locator('#residentialArea')
      .fill(declaration.mother.address.residentialArea)
    await page.locator('#street').fill(declaration.mother.address.street)
    await page.locator('#number').fill(declaration.mother.address.number)
    await page
      .locator('#zipCode')
      .fill(declaration.mother.address.postcodeOrZip)

    await page.locator('#mother____maritalStatus').click()
    await page
      .getByText(declaration.mother.maritalStatus, { exact: true })
      .click()

    await page.locator('#mother____educationalAttainment').click()
    await page
      .getByText(declaration.mother.levelOfEducation, { exact: true })
      .click()

    await continueForm(page)
  })

  await test.step("Fill father's details", async () => {
    await page.locator('#firstname').fill(declaration.father.name.firstNames)
    await page.locator('#surname').fill(declaration.father.name.familyName)

    await fillDate(page, declaration.father.birthDate)

    await page.locator('#father____idType').click()
    await page
      .getByText(declaration.father.identifier.type, { exact: true })
      .click()

    await page.locator('#father____nid').fill(declaration.father.identifier.id)

    await page.locator('#father____nationality').click()
    await page
      .getByText(declaration.father.nationality, { exact: true })
      .click()

    await page.locator('#father____addressSameAs_YES').click()

    await page.locator('#father____maritalStatus').click()
    await page
      .getByText(declaration.father.maritalStatus, { exact: true })
      .click()

    await page.locator('#father____educationalAttainment').click()
    await page
      .getByText(declaration.father.levelOfEducation, { exact: true })
      .click()

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Go to review', async () => {
    await goToSection(page, 'review')
  })

  await test.step('Fill up informant comment & signature', async () => {
    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()
  })

  await test.step('Declare', async () => {
    await triggerDeclarationAction(page, 'Declare')
  })

  await test.step('Archival is not available for HO', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatName(declaration.child.name))

    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Assign', exact: true })
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Archive', exact: true })
    ).not.toBeVisible()
  })

  await test.step('Logout', async () => {
    await logout(page)
  })

  await test.step('Login as RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Navigate to the event overview page', async () => {
    await page.getByText('Pending validation').click()

    // Expect not to see a quick action for Archival
    await expect(
      page.getByRole('button', { name: 'Archive', exact: true })
    ).not.toBeVisible()

    await openRecordByTitle(page, formatName(declaration.child.name))
  })

  await test.step('Archive the declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Archive')
    await page.getByRole('button', { name: 'Archive', exact: true }).click()
  })

  await test.step('Archived declaration is not visible in workqueues', async () => {
    await page.getByRole('button', { name: 'Pending validation' }).click()
    await expect(
      page.getByRole('button', {
        name: formatName(declaration.child.name)
      })
    ).not.toBeVisible()
  })

  await test.step('Archived declaration can be found via search', async () => {
    await searchFromSearchBar(page, formatName(declaration.child.name))
    await expect(page.getByTestId('status-value')).toHaveText('Archived')
  })

  await test.step('Assert available actions', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    const options = await page
      .locator('#action-Dropdown-Content li')
      .allTextContents()
    expect(options).toStrictEqual(['Assign', 'Escalate', 'Unarchive'])
  })
})

test('Archival of declaration pending validation', async ({ page }) => {
  let declaration: Declaration

  await test.step('Initialise a declared birth record via API', async () => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
  })

  await test.step('Login as RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Navigate to the event overview page', async () => {
    await page.getByText('Pending validation').click()

    await openRecordByTitle(page, formatV2ChildName(declaration))
  })

  await test.step('Validate the declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await triggerDeclarationAction(page, 'Validate')
  })

  await test.step('Confirm the declaration is in "Pending registration" -workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')
    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
  })

  await test.step('Archive the declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    // @TODO
    await selectAction(page, 'Archive')
    await page.getByRole('button', { name: 'Archive', exact: true }).click()
  })

  await test.step('Archived declaration is not visible in workqueues', async () => {
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })

  await test.step('Archived declaration can be found via search', async () => {
    await page.locator('#searchText').fill(formatV2ChildName(declaration))
    await page.locator('#searchIconButton').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })
})

test('Archival of rejected declaration', async ({ page }) => {
  let declaration: Declaration
  let eventId: string

  const rejectionReason = 'Mother NID is missing. Please update and resubmit.'

  await test.step('Initialise a rejected birth record via API', async () => {
    const registrarToken = await getToken(CREDENTIALS.REGISTRAR)

    const declareRes = await createDeclaration(
      registrarToken,
      undefined,
      ActionType.DECLARE
    )
    declaration = declareRes.declaration
    eventId = declareRes.eventId

    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${registrarToken}`
    )

    const registrarUserId = JSON.parse(
      Buffer.from(registrarToken.split('.')[1], 'base64').toString()
    ).sub

    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: registrarUserId
    })

    await client.event.actions.reject.request.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration: {},
      annotation: {},
      content: { reason: rejectionReason }
    })
  })

  await test.step('Login as Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Rejected record appears in the Pending updates workqueue', async () => {
    await assertRecordInWorkqueue({
      page,
      name: formatV2ChildName(declaration),
      workqueues: [{ title: 'Pending updates', exists: true }]
    })
  })

  await test.step('Archive the rejected declaration', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(page.getByTestId('flags-value')).toContainText('Rejected')

    await selectAction(page, 'Archive')

    const archiveResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.archive') && res.ok()
    )
    await page.getByRole('button', { name: 'Archive', exact: true }).click()
    await archiveResponse
  })

  await test.step('Archived rejected record no longer appears in the Pending updates workqueue', async () => {
    await assertRecordInWorkqueue({
      page,
      name: formatV2ChildName(declaration),
      workqueues: [{ title: 'Pending updates', exists: false }]
    })
  })

  await test.step('Archived rejected record cannot be edited', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Archived')
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    const options = await page
      .locator('#action-Dropdown-Content li')
      .allTextContents()
    expect(options).toStrictEqual(['Assign', 'Escalate', 'Unarchive'])
  })
})

test('Archival and unarchival of a notified declaration', async ({ page }) => {
  let declaration: Declaration

  await test.step('Initialise a notified birth record via API', async () => {
    const hospitalOfficialToken = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)

    const notifyRes = await createDeclaration(
      hospitalOfficialToken,
      undefined,
      ActionType.NOTIFY
    )
    declaration = notifyRes.declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Notified record appears in the Notifications work queue', async () => {
    await navigateToWorkqueue(page, 'Notifications')
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
  })

  await test.step('Archive the notified declaration', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await expect(page.getByTestId('status-value')).toHaveText('Notified')

    await selectAction(page, 'Archive')

    const archiveResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.archive') && res.ok()
    )
    await page.getByRole('button', { name: 'Archive', exact: true }).click()
    await archiveResponse
  })

  await test.step('Archived declaration shows Archived status', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Archived')
  })

  await test.step('Archived record no longer appears in the Notifications work queue', async () => {
    await page.getByTestId('exit-event').click()
    await navigateToWorkqueue(page, 'Notifications')
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeHidden()
  })

  await test.step('Unarchive the declaration', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await selectAction(page, 'Unarchive')

    const unarchiveResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.unarchive') && res.ok()
    )
    await page.getByRole('button', { name: 'Unarchive', exact: true }).click()
    await unarchiveResponse
  })

  await test.step('Unarchived declaration reverts to Notified status', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await test.step('Unarchived record reappears in the Notifications workqueue', async () => {
    await page.getByTestId('exit-event').click()
    await navigateToWorkqueue(page, 'Notifications')
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
  })
})
