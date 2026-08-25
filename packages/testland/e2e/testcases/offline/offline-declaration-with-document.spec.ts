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
import { expect, Response, test } from '@playwright/test'
import { faker } from '@faker-js/faker'

import {
  continueForm,
  drawSignature,
  getRandomDate,
  goToSection,
  login,
  uploadImage
} from '@e2e/support/helpers'
import {
  mockNetworkConditions,
  restoreNetworkConditions
} from '@e2e/support/mock-network-conditions'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'

/*
 * A declaration created offline is stored locally under a temporary id (`tmp-<uuid>`),
 * and supporting document paths are derived from that id. The declare action is sent
 * with the canonical id the server assigned, so a file left behind at the temporary
 * path fails the server-side file check with "File not found" — a 400 the client
 * retries forever, leaving the record stuck in the outbox.
 */
test('Birth declaration made offline with a supporting document syncs after reconnecting', async ({
  page
}) => {
  // Five form pages offline plus waiting for the queued mutations to drain.
  test.slow()

  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200),
      placeOfBirth: 'Health Institution',
      birthLocation: 'Klow Village Hospital'
    },
    informant: {
      relation: 'Mother',
      email: faker.internet.email()
    },
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(22, 200),
      identifier: { type: 'None' },
      /*
       * Deliberately a different area than the place of birth: the address options
       * are matched by text, and reusing Central/Ibombo would also match the birth
       * location rendered on the same page.
       */
      address: { province: 'Sulaka', district: 'Irundu', village: 'Xhosa' }
    },
    father: { reason: 'Father is unknown' }
  }

  /* Successful uploads. A request made while offline never gets a response. */
  const uploads: Response[] = []

  page.on('response', (response) => {
    if (
      response.request().method() === 'POST' &&
      response.url().includes('/api/upload') &&
      response.ok()
    ) {
      uploads.push(response)
    }
  })

  await login(page, CREDENTIALS.REGISTRATION_OFFICER)

  /*
   * Route chunks are lazy-loaded. Where the client is served without a service worker
   * (local development), entering the declaration flow for the first time while
   * offline renders an empty page, so walk into it once online first. The event
   * created here is abandoned.
   */
  await page.click('#header-new-event')
  await page.getByLabel('Birth').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.locator('#firstname')).toBeVisible()
  await page.goto(CLIENT_URL)

  await mockNetworkConditions(page, 'offline')

  await page.click('#header-new-event')
  await page.getByLabel('Birth').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // The event exists only in the browser at this point, under a temporary id.
  await expect(page).toHaveURL(/\/events\/declare\/tmp-/)

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
      .getByText(declaration.child.placeOfBirth, { exact: true })
      .click()
    await page
      .locator('#child____birthLocation')
      .fill(declaration.child.birthLocation.slice(0, 3))
    await page.getByText(declaration.child.birthLocation).click()
    await continueForm(page)
  })

  await test.step('Fill informant details', async () => {
    await page.locator('#informant____relation').click()
    await page
      .getByText(declaration.informant.relation, { exact: true })
      .click()
    await page.locator('#informant____email').fill(declaration.informant.email)
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

  await test.step("Fill father's details", async () => {
    await page.getByLabel("Father's details are not available").check()
    await page.locator('#father____reason').fill(declaration.father.reason)
    await continueForm(page)
  })

  await test.step('Attach a supporting document', async () => {
    await goToSection(page, 'documents')
    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]')
    )

    // Nothing can reach the server yet, so the upload is queued.
    expect(uploads).toEqual([])
  })

  await test.step('Declare', async () => {
    await goToSection(page, 'review')

    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    /*
     * `triggerDeclarationAction` waits for the action's response, which cannot arrive
     * while offline — the mutation is queued instead.
     */
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page.getByText('Declare', { exact: true }).click()
    await page.locator('#confirm_Declare').click()
  })

  const declareResponse = page.waitForResponse(
    (response) =>
      response.url().includes('event.actions.declare') &&
      response.request().method() === 'POST'
  )

  await restoreNetworkConditions(page)

  /*
   * The declare action refers to its files by the canonical event id, so they have to
   * have been stored under it as well.
   */
  expect((await declareResponse).status()).toBe(200)

  const storedPaths = await Promise.all(
    uploads.map(async (upload) => (await upload.text()).trim())
  )

  expect(storedPaths.length).toBeGreaterThan(0)
  for (const storedPath of storedPaths) {
    expect(storedPath).not.toContain('tmp-')
  }
})
