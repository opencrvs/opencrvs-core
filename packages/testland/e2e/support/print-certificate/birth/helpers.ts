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
import { Locator, Page, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import {
  ensureAssignedToFullName,
  ensureAssignedToUser,
  selectAction
} from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { CLIENT_URL, CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'

export async function selectCertificationType(page: Page, type: string) {
  await page
    .locator('#certificateTemplateId .react-select__dropdown-indicator')
    .click()
  await page
    .locator('.react-select__menu')
    .getByText(type, { exact: true })
    .click()
}

export async function selectRequesterType(page: Page, type: string) {
  await page.locator('#collector____requesterId').click()
  await page.getByText(type, { exact: true }).click()
}

export async function navigateToCertificatePrintAction(
  page: Page,
  declaration: {
    'child.name': {
      firstname: string
      surname: string
    }
    [key: string]: any
  },
  username: (typeof CREDENTIALS)[keyof typeof CREDENTIALS]
) {
  const childName = formatV2ChildName(declaration)

  await openRecordByTitle(page, childName)

  await ensureAssignedToUser(page, username)
  await selectAction(page, 'Print')
}

/**
 * Searches for the birth record, assigns it to the user with the full name
 * and opens the Print action. Use it for a user that the test creates, who
 * has no entry in `CREDENTIALS`.
 */
export async function openPrintAction(
  page: Page,
  declaration: Parameters<typeof formatV2ChildName>[0],
  userFullName: string
) {
  await page.goto(CLIENT_URL)
  await page
    .getByRole('textbox', { name: 'Search for a record' })
    .fill(formatV2ChildName(declaration))

  await page.getByRole('button', { name: 'Search' }).click()
  await openRecordByTitle(page, formatV2ChildName(declaration))
  await ensureAssignedToFullName(page, userFullName)
  await selectAction(page, 'Print')
}

/**
 * Fetches the file that an <image> of the certificate preview links, in the
 * same way as the browser does, and checks that the file is an image.
 */
export async function expectImageToRender(image: Locator) {
  const href = await image.getAttribute('xlink:href')

  expect(href, 'The certificate links the image').toBeTruthy()

  const contentType = await image.page().evaluate(async (url) => {
    const response = await fetch(url)
    return response.headers.get('content-type')
  }, href ?? '')

  expect(contentType).toMatch(/^image\//)
}

export function getRowByTitle(page: Page, title: string) {
  return page
    .locator('[id^="row_"]')
    .filter({ has: page.getByRole('button', { name: title }) })
}

/**
 * Opens a record from a workqueue list by its title (e.g. formatted child name) and **verifies it**
 *
 * NOTE:
 * Application polls continuously for updates. E2E tests are run in parallel.
 * It is likely that the same workqueue will get updated, and **during** the time we select a row, and click it, it actually has diffrent user and the test fails down the line.
 *
 */
export async function openRecordByTitle(page: Page, title: string) {
  await expect(async () => {
    await getRowByTitle(page, title)
      .getByRole('button', { name: title })
      .click()
    try {
      // target the event overview title to make sure this is the right one.
      await expect(
        page.getByRole('heading', { name: title, level: 1 })
      ).toBeVisible({ timeout: 3_000 })
    } catch (error) {
      await page.goBack()
      // This triggers toPass retry loop if the updated happened and we picked wrong one.
      throw error
    }
  }).toPass({
    timeout: 60_000,
    intervals: [...Array(5).fill(1_000), ...Array(5).fill(2_000), 5_000]
  })
}

export async function clickWorkqueueActionByTitle(
  page: Page,
  title: string,
  action: string
) {
  await expect(async () => {
    await getRowByTitle(page, title)
      .getByRole('button', { name: action })
      .click()
    try {
      // target the event review title to make sure this is the right one.
      expect(await page.locator('#header_subject').textContent()).toMatch(title)
    } catch (error) {
      await page.goBack()
      // This triggers toPass retry loop if the updated happened and we picked wrong one.
      throw error
    }
  }).toPass({
    timeout: 60_000,
    intervals: [...Array(5).fill(1_000), ...Array(5).fill(2_000), 5_000]
  })
}

export async function printAndExpectPopup(page: Page) {
  await page.getByRole('button', { name: 'Yes, print certificate' }).click()
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Print', exact: true }).click()
  const popup = await popupPromise
  const downloadPromise = popup.waitForEvent('download')
  const download = await downloadPromise

  // Check that the popup URL contains PDF content
  await expect(popup.url()).toBe('about:blank')
  await expect(download.suggestedFilename()).toMatch(/^.*\.pdf$/)
}

export async function printCertificateViaApi({
  token,
  eventId,
  templateId,
  requesterId = 'INFORMANT'
}: {
  token: string
  eventId: string
  templateId: string
  requesterId?: string
}) {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  const { sub: userId } = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString()
  )

  await client.event.actions.assignment.assign.mutate({
    eventId,
    type: 'ASSIGN',
    assignedTo: userId,
    transactionId: uuidv4(),
    declaration: {},
    annotation: {},
    keepAssignment: true
  })

  await client.event.actions.printCertificate.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration: {},
    annotation: {
      'collector.requesterId': requesterId,
      // Every collector but 'print in advance' passes through the identity
      // verification page, which the backend requires an answer for.
      ...(requesterId === 'PRINT_IN_ADVANCE'
        ? {}
        : { 'collector.identity.verify': true })
    },
    content: { templateId }
  })
}
