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
import { test, expect, type Page } from '@playwright/test'
import { login } from '../../../../helpers'
import { openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validation of MOSIP integration for informants/ mother/ father
 * details page" - the QR_READER half of the `ID_READER` field (the
 * e-signet LINK_BUTTON half is covered by 10.validate-esignet-flow.spec.ts).
 *
 * The camera-permission tutorial copy below is real, shipped UI text (see
 * packages/client/src/i18n/messages/views/qr-reader.ts and
 * packages/components/src/IdReader/readers/QrReader/QrReader.tsx) - verified
 * against source, not copied verbatim from the QA doc.
 *
 * There is currently no Playwright-usable way to feed a real or fake QR
 * scan into the browser's camera pipeline (only a Storybook-only
 * `mockCamera` decorator exists, see IdReader.interaction.stories.tsx, and
 * it is not wired into packages/testland). Sub-cases that require an actual
 * scan result (successful scan auto-populating fields, an "invalid QR"
 * error message) are marked test.skip with @TODO - the "invalid QR" error
 * string from the QA doc does not exist anywhere in the codebase, so it is
 * not asserted on.
 */

const beginAtInformantPageAsGrandfather = async (page: Page) => {
  await login(page)
  await openBirthDeclaration(page)
  // Child name + Grandfather informant combination from the birth
  // sample-data sheet's sample 3 (tests an underscore in the name).
  await page.locator('#firstname').fill('John_Peter')
  await page.locator('#surname').fill('Smith')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Grandfather', { exact: true }).click()
}

trackAndDeleteCreatedEvents()

test('Validate the ID verification block and the Scan QR Code dialogue', async ({
  page
}) => {
  await beginAtInformantPageAsGrandfather(page)

  await test.step('1. Validate the ID verification block', async () => {
    /*
     * Expected result: two buttons - "Scan QR code" and "Authenticate with
     * National ID system" - alongside the manual fields
     */
    await expect(
      page.getByRole('button', { name: 'Scan QR code' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Authenticate with National ID system'
      })
    ).toBeVisible()
    await expect(page.locator('#firstname')).toBeVisible()
    await expect(page.locator('#firstname')).toBeEditable()
  })

  await test.step('3. Validate the "Scan QR Code" dialogue', async () => {
    await page.getByRole('button', { name: 'Scan QR code' }).click()

    /*
     * Expected result: the "Scan QR code" dialog opens with the camera
     * guidance copy
     */
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Scan QR code', level: 2 })
    ).toBeVisible()
    await expect(
      page.getByText('Ensure your camera is clean and functional.')
    ).toBeVisible()
    await expect(
      page.getByText(
        'Hold the device steadily 6-12 inches away from the QR code.'
      )
    ).toBeVisible()
    await expect(
      page.getByText(
        'Ensure the QR code is well-lit and not damaged or blurry.'
      )
    ).toBeVisible()

    await page.getByTestId('close-dialog').click()

    /*
     * Expected result: the dialog closes
     */
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  await test.step('7. Verify "e-signet" navigates to the country implementation', async () => {
    await page
      .getByRole('link', { name: 'Authenticate with National ID system' })
      .click()

    /*
     * Expected result: navigates to the country's e-signet implementation
     */
    await expect(page).toHaveURL(/authorize/)
  })
})

// @TODO: no Playwright-usable camera/QR mock exists in packages/testland yet
// - see the file-level note above.
test.skip('4-6. Scan a valid/invalid QR code, verify auto-populated fields cannot be edited', async () => {})
