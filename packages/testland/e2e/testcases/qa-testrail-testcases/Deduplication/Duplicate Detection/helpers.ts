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
import { format } from 'date-fns'
import { fillDate } from '../../../birth/helpers'

export const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')

export const toDateParts = (date: Date) => ({
  dd: format(date, 'dd'),
  mm: format(date, 'MM'),
  yyyy: format(date, 'yyyy')
})

export function fakerNameAtLeast(
  min: number,
  generator: () => string
): string {
  let value = generator()
  while (value.length < min) {
    value = generator()
  }
  return value
}

export function withOneLetterChanged(value: string): string {
  const first = value[0]
  const base = first.toLowerCase()
  const replacement =
    base === 'z' ? 'a' : String.fromCharCode(base.charCodeAt(0) + 1)
  const isUpperCase = first === first.toUpperCase()

  return (
    (isUpperCase ? replacement.toUpperCase() : replacement) + value.slice(1)
  )
}

export const formatDeceasedName = (obj: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) => `${obj['deceased.name'].firstname} ${obj['deceased.name'].surname}`

/**
 * Changes a name field (e.g. `child.name`, `mother.name`, `deceased.name`)
 * from the "Edit"-action review page, then returns to review.
 */
export async function editNameField(
  page: Page,
  fieldName: string,
  name: { firstname: string; surname: string }
) {
  await page.getByTestId(`change-button-${fieldName}`).click()
  await page.getByTestId('text__firstname').fill(name.firstname)
  await page.getByTestId('text__surname').fill(name.surname)
  await page.getByRole('button', { name: 'Go to review' }).click()
}

/**
 * Changes a date field (e.g. `child.dob`, `deceased.dob`, `eventDetails.date`)
 * from the "Edit"-action review page, then returns to review.
 */
export async function editDateField(
  page: Page,
  fieldName: string,
  date: { dd: string; mm: string; yyyy: string }
) {
  await page.getByTestId(`change-button-${fieldName}`).click()
  await fillDate(page, date)
  await page.getByRole('button', { name: 'Go to review' }).click()
}

/**
 * Changes a single free-text field (e.g. `mother.nid`, `deceased.nid`) from
 * the "Edit"-action review page, then returns to review.
 */
export async function editTextField(
  page: Page,
  fieldName: string,
  fieldTestId: string,
  value: string
) {
  await page.getByTestId(`change-button-${fieldName}`).click()
  await page.getByTestId(fieldTestId).fill(value)
  await page.getByRole('button', { name: 'Go to review' }).click()
}
