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
import { type Page } from '@playwright/test'
import {
  continueForm,
  goToSection,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { fillDate, generateBirthInputs } from './helpers'

/**
 * Inputs for the birth notification form (see `src/events/birth/forms/notificationForm.ts`).
 * Notifiers (hospital officials) can only choose a health facility as the place of birth.
 */
export function generateBirthNotificationInputs() {
  return generateBirthInputs({ includeOptionalFields: true })
}

export type BirthNotificationInputs = ReturnType<
  typeof generateBirthNotificationInputs
>

/**
 * Starts a new birth event as a notifier. Users who can notify go straight
 * into the notify flow, which has no introduction page.
 */
export async function startBirthNotification(page: Page) {
  await page.click('#header-new-event')
  await page.getByLabel('Birth').click()
  await page.getByRole('button', { name: 'Continue' }).click()
}

/** Fills the child page of the notification form and continues to the mother page. */
export async function fillNotificationChildPage(
  page: Page,
  inputs: BirthNotificationInputs
) {
  await page.locator('#firstname').fill(inputs.child.name.firstNames)
  await page.locator('#surname').fill(inputs.child.name.familyName)

  await fillDate(page, inputs.child.birthDate)

  await page.locator('#child____birthType').click()
  await page.getByText(inputs.birthType, { exact: true }).click()

  await page.locator('#child____attendantAtBirth').click()
  await page.getByText(inputs.attendantAtBirth, { exact: true }).click()

  await page.locator('#child____gender').click()
  await page.getByText(inputs.child.gender, { exact: true }).click()

  await page.locator('#child____placeOfBirth').click()
  await page.getByText(inputs.placeOfBirth, { exact: true }).click()
  await page
    .locator('#child____birthLocation')
    .fill(inputs.birthLocation.facility.slice(0, 3))
  await page.getByText(inputs.birthLocation.facility).click()

  await page
    .locator('#child____weightAtBirth')
    .fill(inputs.weightAtBirth.toString())

  await continueForm(page)
}

/** Fills the mother page of the notification form. */
export async function fillNotificationMotherPage(
  page: Page,
  inputs: BirthNotificationInputs
) {
  await page.locator('#firstname').fill(inputs.mother.name.firstNames)
  await page.locator('#surname').fill(inputs.mother.name.familyName)

  await fillDate(page, inputs.mother.birthDate)

  await page.locator('#informant____email').fill(inputs.informantEmail)
}

/** Fills the whole notification form and continues to its review page. */
export async function fillNotificationForm(
  page: Page,
  inputs: BirthNotificationInputs
) {
  await fillNotificationChildPage(page, inputs)
  await fillNotificationMotherPage(page, inputs)
  await goToSection(page, 'review')
}

/** Notifies the event from the notification review page. */
export async function notifyFromReview(page: Page) {
  await triggerDeclarationAction(page, 'Notify')
}

/**
 * From the Edit review of a notified record, fills the declaration-only sections
 * (informant, mother's ID and address, father) and returns to the review page.
 */
export async function fillDeclarationOnlyFields(
  page: Page,
  inputs: BirthNotificationInputs
) {
  await page
    .getByTestId('accordion-Accordion_informant')
    .getByRole('button', { name: 'Change all' })
    .click()

  await page.locator('#informant____relation').click()
  await page.getByText(inputs.informantType, { exact: true }).click()
  await page.locator('#informant____email').fill(inputs.informantEmail)
  await continueForm(page)

  await page.locator('#firstname').fill(inputs.mother.name.firstNames)
  await page.locator('#surname').fill(inputs.mother.name.familyName)
  await fillDate(page, inputs.mother.birthDate)
  await page.locator('#mother____idType').click()
  await page.getByText(inputs.mother.identifier.type, { exact: true }).click()
  await page.locator('#mother____nid').fill(inputs.mother.identifier.id)
  await page.locator('#country').click()
  await page
    .locator('#country input')
    .fill(inputs.mother.address.country.slice(0, 3))
  await page
    .locator('#country')
    .getByText(inputs.mother.address.country, { exact: true })
    .click()
  await page.locator('#province').click()
  await page.getByText(inputs.mother.address.province, { exact: true }).click()
  await page.locator('#district').click()
  await page.getByText(inputs.mother.address.district, { exact: true }).click()
  await page.locator('#village').click()
  await page.getByText(inputs.mother.address.village, { exact: true }).click()
  await continueForm(page)

  await page.locator('#firstname').fill(inputs.father.name.firstNames)
  await page.locator('#surname').fill(inputs.father.name.familyName)
  await fillDate(page, inputs.father.birthDate)
  await page.locator('#father____idType').click()
  await page.getByText(inputs.father.identifier.type, { exact: true }).click()
  await page.locator('#father____nid').fill(inputs.father.identifier.id)
  await page.locator('#father____nationality').click()
  await page.getByText(inputs.father.nationality, { exact: true }).click()
  await page.locator('#father____addressSameAs_YES').click()

  await page.getByRole('button', { name: 'Go to review' }).click()
}
