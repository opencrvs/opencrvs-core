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
import { expect, Page, test } from '@playwright/test'

import { goToSection, login, uploadImage } from '@e2e/support/helpers'
import {
  mockNetworkConditions,
  restoreNetworkConditions
} from '@e2e/support/mock-network-conditions'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'

const PDF_FIXTURE = './e2e/assets/sample.pdf'

/*
 * pdf.js runs its parser in a web worker loaded from `/pdfjs/pdf.worker.min.mjs`.
 * A preview opened offline only works if the service worker precached it.
 * Workbox builds its precache from `injectManifest.globPatterns` in `packages/client/vite.config.ts`
 */

/*
 * Workbox precaches during the service worker's install event, which can land after
 * the page itself has loaded, so poll for a while before concluding there is none.
 */
async function hasPrecachedBuildAssets(page: Page) {
  const deadline = Date.now() + 30 * 1000

  while (Date.now() < deadline) {
    const precached = await page.evaluate(async () => {
      if (!('caches' in window)) {
        return false
      }

      const cacheNames = await caches.keys()

      for (const cacheName of cacheNames.filter((name) =>
        name.includes('precache')
      )) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()

        if (
          requests.some((request) =>
            new URL(request.url).pathname.startsWith('/assets/')
          )
        ) {
          return true
        }
      }

      return false
    })

    if (precached) {
      return true
    }

    await page.waitForTimeout(1000)
  }

  return false
}

test('A PDF attached offline can be previewed offline', async ({ page }) => {
  await login(page, CREDENTIALS.REGISTRATION_OFFICER)

  // Ensure eventConfigs are cached
  await page.click('#header-new-event')
  await page.getByLabel('Birth').waitFor()
  await page.goto(CLIENT_URL)

  /*
   * Against the local development server the client is served by Vite with no
   * precache at all, so nothing here can either pass or fail meaningfully. In CI
   * the suite runs against a deployed production build, where it can.
   */
  test.skip(
    !(await hasPrecachedBuildAssets(page)),
    'The development server serves the client without a precache, so there is nothing for an offline preview to read.'
  )

  /*
   * `mockNetworkConditions` emulates offline over CDP, which covers requests made
   * by the page but NOT the script load of a dedicated worker: pdf.js's
   * `new Worker('/pdfjs/pdf.worker.min.mjs')` still completes while the page is
   * "offline". Routing is the only thing that reaches that request, so the worker
   * is cut off here as well — leaving the precache as its only possible source,
   * which is the whole point of the test.
   */
  let workerRequestedOverNetwork = false

  await page.context().route('**/pdfjs/pdf.worker.min.mjs', (route) => {
    workerRequestedOverNetwork = true
    return route.abort('internetdisconnected')
  })

  await mockNetworkConditions(page, 'offline')

  await test.step('Start a birth declaration and continue past every page', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // The event exists only in the browser at this point, under a temporary id.
    await expect(page).toHaveURL(/\/events\/declare\/tmp-/)

    await goToSection(page, 'documents')
    await expect(
      page.getByText('Upload supporting documents', { exact: true })
    ).toBeVisible()
  })

  await test.step('Attach a PDF', async () => {
    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]'),
      PDF_FIXTURE
    )
  })

  await test.step('Preview the PDF', async () => {
    await page
      .locator('[id^="preview-list-"]')
      .getByText('Notification of birth', { exact: true })
      .click()

    const preview = page.locator('#preview_image_field')
    await expect(preview).toBeVisible()

    /*
     * The spinner clears once pdf.js has either rendered every page or given up,
     * so waiting for it first lets the assertions below report the cause rather
     * than time out.
     */
    await expect(preview.getByText('Loading...')).toBeHidden({
      timeout: 30 * 1000
    })

    expect(
      workerRequestedOverNetwork,
      'pdf.js went to the network for its worker, so the service worker had not precached it'
    ).toBe(false)

    await expect(preview.getByText('Failed to load PDF')).toBeHidden()

    /*
     * pdf.js appends one canvas per page once the worker is up and the document
     * parsed, so the first canvas is the proof that the PDF actually rendered.
     */
    await expect(preview.locator('canvas').first()).toBeVisible()

    await page.locator('#preview_close').click()
    await expect(preview).toBeHidden()
  })

  await restoreNetworkConditions(page)
})
