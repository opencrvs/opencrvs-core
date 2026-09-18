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
import { expect, test, type Page } from '@playwright/test'
import { getToken, login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/death-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/death/helpers'
import { AddressType } from '@opencrvs/toolkit/events'

async function expectInPdf(page: Page, text: string) {
  await expect(page.locator('#print')).toContainText(text)
}

test.describe("Validate 'Death Certificate' PDF details", () => {
  test('Standard certificate renders deceased name, place of death and registrar', async ({
    page
  }) => {
    test.setTimeout(180_000)

    let declaration: Declaration

    await test.step('Seed a registered death record (via API)', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(token)

      declaration = res.declaration
    })

    await test.step('Log in as the registrar', async () => {
      await login(page)
    })

    await test.step('Open the death certificate preview', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        declaration,
        CREDENTIALS.REGISTRAR
      )
      await selectCertificationType(page, 'Death Certificate')
      await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('Validate deceased name', async () => {
      await expectInPdf(
        page,
        `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
      )
    })

    await test.step('Validate deceased place of death', async () => {
      await expectInPdf(page, 'Klow, Ibombo, Central, Farajaland')
    })

    await test.step('Validate registrar name', async () => {
      await expectInPdf(page, 'Kennedy Mweene')
    })
  })
})

test.describe("Validate 'Death Certificate Certified Copy' PDF details", () => {
  test('Certified copy renders deceased, spouse, place of death and office name', async ({
    page
  }) => {
    test.setTimeout(180_000)

    let declaration: Declaration

    await test.step('Seed a registered death record (via API)', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(token)

      declaration = res.declaration
    })

    await test.step('Log in as the registrar', async () => {
      await login(page)
    })

    await test.step('Open the certified copy preview', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        declaration,
        CREDENTIALS.REGISTRAR
      )
      await selectCertificationType(page, 'Death Certificate Certified Copy')
      await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('Validate deceased name', async () => {
      await expectInPdf(
        page,
        `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
      )
    })

    await test.step('Validate deceased place of death', async () => {
      await expectInPdf(page, 'Klow, Ibombo, Central, Farajaland')
    })

    await test.step('Validate registrar name', async () => {
      await expectInPdf(page, 'Registrar: Kennedy Mweene')
    })

    await test.step('Place of registration includes the office name', async () => {
      await expectInPdf(page, 'Ibombo District Office')
    })

    await test.step('Validate spouse name', async () => {
      await expectInPdf(
        page,
        `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
      )
      await expectInPdf(page, 'Spouse')
    })
  })
})

test.describe('International addresses render the required street levels', () => {
  const EXPECTED = 'Ngozi District, Ngozi Province, Burundi'

  const INTERNATIONAL_ADDRESS = {
    country: 'BDI',
    addressType: AddressType.INTERNATIONAL,
    streetLevelDetails: {
      state: 'Ngozi Province',
      district2: 'Ngozi District'
    }
  }

  test('Street levels survive on both death certificate templates', async ({
    page
  }) => {
    test.setTimeout(240_000)

    let declaration: Declaration

    await test.step('Seed a registered death record with international addresses (via API)', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(token, {
        'deceased.address': INTERNATIONAL_ADDRESS,
        'eventDetails.deathLocationOther': INTERNATIONAL_ADDRESS
      })

      declaration = res.declaration
    })

    await test.step('Log in as the registrar', async () => {
      await login(page)
    })

    await test.step("'Death Certificate' keeps the street levels", async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        declaration,
        CREDENTIALS.REGISTRAR
      )
      await selectCertificationType(page, 'Death Certificate')
      await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expectInPdf(page, EXPECTED)
    })
  })

  test('Street levels survive on the death certified copy', async ({
    page
  }) => {
    test.setTimeout(240_000)

    let declaration: Declaration

    await test.step('Seed a registered death record with international addresses (via API)', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(token, {
        'deceased.address': INTERNATIONAL_ADDRESS,
        'eventDetails.deathLocationOther': INTERNATIONAL_ADDRESS
      })

      declaration = res.declaration
    })

    await test.step('Log in as the registrar', async () => {
      await login(page)
    })

    await test.step("'Death Certificate Certified Copy' keeps the street levels", async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        declaration,
        CREDENTIALS.REGISTRAR
      )
      await selectCertificationType(page, 'Death Certificate Certified Copy')
      await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      // Both "Resident at" (row 3) and "Place of death" (row 7).
      await expect(page.locator('#print')).toContainText(EXPECTED)
    })
  })
})
