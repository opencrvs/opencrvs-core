import { expect, test, type Page } from '@playwright/test'

import { login, getToken, validateActionMenuButton } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import { ensureAssignedToUser, expectInUrl } from '../../utils'
import {
  getRowByTitle,
  openRecordByTitle
} from '../print-certificate/birth/helpers'

test.describe
  .serial('5(b) Validate "Pending registration"-workqueue for Registrar', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    eventId = res.eventId

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('5.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('5.1 Go to "Pending registration"-workqueue', async () => {
    await page.getByText('Pending registration').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending registration'
    )
  })

  test('5.2 validate the list', async () => {
    const header = page.locator('div[class^="TableHeader"]')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Last updated',
      ''
    ])

    const row = getRowByTitle(page, formatV2ChildName(declaration))
    const cells = row.locator(':scope > div')

    await expect(cells.nth(0)).toHaveText(formatV2ChildName(declaration))
    await expect(cells.nth(1)).toHaveText('Birth')
    await expect(cells.nth(2)).toHaveText(
      declaration['child.dob'].split('T')[0]
    )
  })

  test('5.4 Click a name', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expectInUrl(
      page,
      `events/${eventId}?backTo=/workqueue/pending-registration`
    )
  })

  test('5.5 Register action should be available for declared and validated record', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await validateActionMenuButton(page, 'Register', true)
  })
})
