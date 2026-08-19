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
import { getToken, login, switchEventTab } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../test-data/birth-declaration-with-mother-father'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  waitForCorrectionAction
} from '../../utils'
import {
  formatV2ChildName,
  getAdministrativeAreas,
  getIdByName
} from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'
import { AddressType } from '@opencrvs/toolkit/events'

test('Cleared field values are removed after correcting a registered birth record', async ({
  page
}) => {
  const weightAtBirth = 3.2
  const town = faker.location.city()
  const residentialArea = faker.location.county()

  let declaration: Declaration
  let eventId: string
  let weightValueBefore = ''
  let recordUrl = ''

  await test.step('Create and register a birth record via API', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const administrativeAreas = await getAdministrativeAreas(token)
    const village = getIdByName(administrativeAreas, 'Klow')

    const res = await createDeclaration(
      token,
      {
        'child.weightAtBirth': weightAtBirth,
        'child.birthLocation.privateHome': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: village,
          streetLevelDetails: { town, residentialArea }
        }
      },
      'REGISTER',
      'PRIVATE_HOME'
    )

    declaration = res.declaration
    eventId = res.eventId
  })

  await test.step('Login as Local Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Open the registered record and capture the values shown', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    recordUrl = page.url()

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await switchEventTab(page, 'Record')

    const weight = page.getByTestId('child.weightAtBirth-value')
    await expect(weight).toContainText(weightAtBirth.toString())
    weightValueBefore = (await weight.innerText()).trim()

    const birthLocation = page.getByTestId(
      'child.birthLocation.privateHome-value'
    )
    await expect(birthLocation).toContainText(town)
    await expect(birthLocation).toContainText(residentialArea)
  })

  await test.step('Start correction and complete the onboarding steps', async () => {
    await selectAction(page, 'Correct')

    await page.locator('#requester____type').click()
    await page.getByText('Informant (Mother)', { exact: true }).click()

    await page.locator('#reason____option').click()
    await page
      .getByText('Myself or an agent made a mistake (Clerical error)', {
        exact: true
      })
      .click()

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()

    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const path = require('path')
    const attachmentPath = path.join(__dirname, '../test-data/image.png')
    const inputFile = page.locator(
      'input[name="documents____supportingDocs"][type="file"]'
    )

    await page.getByTestId('select__documents____supportingDocs').click()
    await page.getByText('Affidavit', { exact: true }).click()
    await inputFile.setInputFiles(attachmentPath)

    await page.getByRole('button', { name: 'Continue' }).click()

    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())
    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(page, `/events/request-correction/${eventId}/review`)
  })

  await test.step('Clear weight at birth and optional residential address fields (town, residential area)', async () => {
    await page.getByTestId('change-button-child.weightAtBirth').click()

    await page.locator('#child____weightAtBirth').fill('')

    await page.getByTestId('text__town').fill('')
    await page.locator('#residentialArea').fill('')

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Correction review shows the cleared weight as deleted', async () => {
    const weightRow = page.getByTestId('child.weightAtBirth-value')
    await expect(weightRow.locator('del')).toContainText(
      weightAtBirth.toString()
    )
  })

  await test.step('Submit the correction', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(page, `/events/request-correction/${eventId}/summary`)

    await page.getByRole('button', { name: 'Correct' }).click()

    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })
  })

  await test.step('Record no longer shows the previously entered weight or address details', async () => {
    await page.goto(recordUrl)

    await expect(page.getByLabel('Assign record')).toBeVisible()
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await switchEventTab(page, 'Record')

    await expect(page.getByTestId('child.weightAtBirth-value')).not.toHaveText(
      weightValueBefore
    )

    const birthLocation = page.getByTestId(
      'child.birthLocation.privateHome-value'
    )
    await expect(birthLocation).not.toContainText(town)
    await expect(birthLocation).not.toContainText(residentialArea)
  })
})
