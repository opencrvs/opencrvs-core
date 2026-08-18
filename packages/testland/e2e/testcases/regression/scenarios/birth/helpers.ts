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
// Every spec in this directory declares one row from the QA regression-test
// sheet's "Birth" tab:
// https://docs.google.com/spreadsheets/d/1g0ReIDGw8lbHC6Am3O0A16S1y0jje8BZ/edit?gid=1406739219#gid=1406739219
import { expect, type Locator, type Page } from '@playwright/test'
import { getToken, uploadImage } from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration as registerBirthForBrn } from '../../../test-data/birth-declaration'

/**
 * react-select options render as plain divs with no `option` role, and the
 * field's already-selected value can match the same text once the dropdown
 * is open (several fields come pre-filled with the same default we're
 * selecting) - so scope the click to the open option list itself rather
 * than a page-wide text match.
 */
export async function selectDropdownOption(page: Page, value: string) {
  await page
    .locator('.react-select__option')
    .getByText(value, { exact: true })
    .click()
}

/**
 * The country field is a searchable typeahead - matches the convention used
 * elsewhere in the package (e.g. death-declaration-3.spec.ts), scoping to
 * the open option list rather than `#country` as a whole, which also
 * contains the field's own current-value text once something is selected.
 */
export async function selectCountry(page: Page, countryName: string) {
  await page.locator('#country').click()
  await page.locator('#country input').fill(countryName.slice(0, 3))
  await page
    .locator('#country .react-select__option', { hasText: countryName })
    .click()
}

/**
 * Registers a birth via the API purely to mint a real registration number,
 * for declarations where a family member is identified by an existing BRN.
 */
export async function fetchBirthRegistrationNumberForTesting() {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const res = await registerBirthForBrn(token)
  expect(res.registrationNumber).toBeDefined()
  return res.registrationNumber!
}

/**
 * Same steps as the shared `uploadImageToSection` in e2e/helpers.ts, but
 * lets the caller pick which file to upload instead of always falling back
 * to the default random image - kept local rather than changing the shared
 * helper's signature for every other caller.
 */
export async function uploadImageToSectionWithFile({
  page,
  sectionLocator,
  sectionTitle,
  buttonLocator,
  image
}: {
  page: Page
  sectionLocator: Locator
  buttonLocator: Locator
  sectionTitle: string
  image: string
}) {
  await sectionLocator.getByText('Select', { exact: true }).click()
  await sectionLocator.getByText(sectionTitle, { exact: true }).click()

  await uploadImage(page, buttonLocator, image)
}
