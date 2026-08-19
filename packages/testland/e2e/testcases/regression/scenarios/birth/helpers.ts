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
import { faker } from '@faker-js/faker'

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
 * A random last name with an apostrophe prefix (e.g. "O'Neill") - exercises
 * the app's apostrophe-in-name validation without hardcoding a single fixed
 * value every run reuses.
 */
export function generateSurnameWithApostrophe() {
  return `O'${faker.person.lastName()}`
}
