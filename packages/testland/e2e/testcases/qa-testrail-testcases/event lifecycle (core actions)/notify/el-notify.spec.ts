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
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../../constants'
import { ensureAssignedToUser } from '../../utils'
import { fillDate } from '../../../../testcases/birth/helpers'
import {
  formatName,
  goToSection,
  login,
  switchEventTab,
  triggerDeclarationAction,
  validateActionMenuButton
} from '../../../../helpers'
import { openRecordByTitle } from '../../helpers'

// Community Leader is used for both events throughout this file: unlike
// Hospital Official (notify-only, see roles.ts), Community Leader holds both
// record.notify and record.declare, so the Action menu actually renders a
// (disabled, while incomplete) 'Declare' item to assert against — matching
// what the spreadsheet's "if 'Declare' button is available" phrasing implies.

// TestRail TC-0055: Verify user can notify complete record
test('Verify user can notify complete record', async ({ page }) => {
  test.setTimeout(180_000)

  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName()
  }
  const motherName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName()
  }
  const deceasedName = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName()
  }
  const spouseName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName()
  }

  await test.step('Login as Community Leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Fill a complete birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()
    await fillDate(page, { dd: '05', mm: '08', yyyy: '2026' })
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Residential address', { exact: true }).click()
    // Country/province/district/village default to the informant's own
    // office location (Farajaland/Central/Ibombo/Klow), so no address
    // fields need to be touched here or on the mother's/spouse's pages.
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('mother@example.com')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(motherName.firstNames)
    await page.locator('#surname').fill(motherName.familyName)
    await fillDate(page, { dd: '15', mm: '06', yyyy: '1998' })
    await page.locator('#mother____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#mother____nid').fill(faker.string.numeric(10))
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByLabel("Father's details are not available").check()
    await page.locator('#father____reason').fill('Father is missing.')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Documents page has no required uploads.
    await goToSection(page, 'review')
  })

  await test.step('Action menu shows Notify for the complete birth declaration', async () => {
    await validateActionMenuButton(page, 'Notify', true)
  })

  await test.step('Notify the complete birth declaration', async () => {
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Complete birth declaration is Notified, with an audit entry', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatName(childName))
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)

    await expect(page.getByTestId('status-value')).toHaveText('Notified')

    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Notified', exact: true }).click()
    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText('Gift Phiri')).toBeVisible()
    await page.locator('#close-dialog').click()
    await page.getByTestId('exit-event').click()
  })

  await test.step('Fill a complete death declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(deceasedName.firstNames)
    await page.locator('#surname').fill(deceasedName.familyName)
    await page.locator('#deceased____gender').click()
    await page.getByText('Male', { exact: true }).click()
    await fillDate(page, { dd: '10', mm: '05', yyyy: '1970' })
    await page.locator('#deceased____idType').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.locator('#deceased____nid').fill(faker.string.numeric(10))
    await page.getByRole('button', { name: 'Continue' }).click()

    await fillDate(page, { dd: '01', mm: '08', yyyy: '2026' })
    await page.locator('#eventDetails____placeOfDeath').click()
    await page
      .getByText("Deceased's usual place of residence", { exact: true })
      .click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#informant____relation').click()
    await page.getByText('Spouse', { exact: true }).click()
    await page.locator('#informant____email').fill('spouse@example.com')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(spouseName.firstNames)
    await page.locator('#surname').fill(spouseName.familyName)
    await fillDate(page, { dd: '20', mm: '02', yyyy: '1972' })
    await page.locator('#spouse____idType').click()
    await page.getByText('None', { exact: true }).click()
    // "Same as deceased's usual place of residence?" defaults to Yes.
    await page.getByRole('button', { name: 'Continue' }).click()

    // Documents page has no required uploads.
    await goToSection(page, 'review')
  })

  await test.step('Action menu shows Notify for the complete death declaration', async () => {
    await validateActionMenuButton(page, 'Notify', true)
  })

  await test.step('Notify the complete death declaration', async () => {
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Complete death declaration is Notified, with an audit entry', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatName(deceasedName))
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)

    await expect(page.getByTestId('status-value')).toHaveText('Notified')

    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Notified', exact: true }).click()
    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText('Gift Phiri')).toBeVisible()
    await page.locator('#close-dialog').click()
  })
})

// TestRail TC-0056: Verify user can notify completely blank record
test('Verify user can notify completely blank record', async ({ page }) => {
  test.setTimeout(180_000)

  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }
  const deceasedName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }

  await test.step('Login as Community Leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Start a birth declaration with only the child’s name filled in', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)

    // Every other field (sex, DOB, place of birth, informant, mother,
    // father) is left blank — Continue is allowed to proceed regardless;
    // required-field validation only surfaces as "Required" text on review.
    await goToSection(page, 'review')
  })

  await test.step('Action menu still shows Notify; Declare is disabled while incomplete', async () => {
    await validateActionMenuButton(page, 'Notify', true)
    await validateActionMenuButton(page, 'Declare', false)
  })

  await test.step('Notify the blank birth declaration', async () => {
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Blank birth declaration is Notified, with an audit entry', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatName(childName))
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)

    await expect(page.getByTestId('status-value')).toHaveText('Notified')

    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Notified', exact: true }).click()
    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText('Gift Phiri')).toBeVisible()
    await page.locator('#close-dialog').click()
    await page.getByTestId('exit-event').click()
  })

  await test.step('Start a death declaration with only the deceased’s name filled in', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(deceasedName.firstNames)
    await page.locator('#surname').fill(deceasedName.familyName)

    await goToSection(page, 'review')
  })

  await test.step('Action menu still shows Notify; Declare is disabled while incomplete', async () => {
    await validateActionMenuButton(page, 'Notify', true)
    await validateActionMenuButton(page, 'Declare', false)
  })

  await test.step('Notify the blank death declaration', async () => {
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Blank death declaration is Notified, with an audit entry', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatName(deceasedName))
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)

    await expect(page.getByTestId('status-value')).toHaveText('Notified')

    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Notified', exact: true }).click()
    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText('Gift Phiri')).toBeVisible()
    await page.locator('#close-dialog').click()
  })
})
