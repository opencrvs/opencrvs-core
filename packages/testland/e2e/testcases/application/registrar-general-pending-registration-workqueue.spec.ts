import { test, expect, type Page } from '@playwright/test'

import { CREDENTIALS } from '../../constants'

import { formatV2ChildName } from '../birth/helpers'
import { createDeclaration } from '../test-data/birth-declaration'
import { getToken, login } from '../../helpers'
import { ActionType } from '@opencrvs/toolkit/events'

test.describe
  .serial("Registar General's 'Pending registration' -workqueue", () => {
  let page: Page
  let embassyDeclarationChildName: string
  let registrarDeclarationChildName: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Declare a birth by Embassy Official', async () => {
    const token = await getToken(CREDENTIALS.EMBASSY_OFFICIAL)

    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    embassyDeclarationChildName = formatV2ChildName(res.declaration)
  })

  test('Declare a birth by Registrar', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    registrarDeclarationChildName = formatV2ChildName(res.declaration)
  })

  test('Login as Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  test("Navigate to 'Pending registration' -workqueue", async () => {
    await page.getByText('Pending registration').click()
  })

  test("Record declared by Embassy Official should show up on Registrar Generals 'Pending registration' -workqueue", async () => {
    await expect(
      page.getByRole('button', { name: embassyDeclarationChildName })
    ).toBeVisible()
  })

  test("Record declared by Registrar should not show up on Registrar Generals 'Pending registration' -workqueue", async () => {
    await expect(
      page.getByRole('button', { name: registrarDeclarationChildName })
    ).not.toBeVisible()
  })
})
