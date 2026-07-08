import { expect, test, type Page } from '@playwright/test'

import { login, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import { ensureAssignedToUser, expectInUrl, selectAction } from '../../utils'
import {
  getRowByTitle,
  openRecordByTitle
} from '../print-certificate/birth/helpers'

test.describe
  .serial('5(a) Validate "Pending validation"-workqueue for RO', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    eventId = res.eventId

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('5.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  test('5.1 Go to "Pending validation"-workqueue', async () => {
    await page.getByText('Pending validation').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending validation'
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

  test('5.3 Click a name', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expectInUrl(
      page,
      `events/${eventId}?backTo=/workqueue/pending-validation`
    )
  })

  test('5.4 Click "Validate"-action', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Validate')

    await expect(
      page.getByRole('heading', { name: 'Validate?', exact: true })
    ).toBeVisible()

    await expect(
      page.getByText(
        'Validating this declaration confirms it meets all requirements and is eligible for registration.'
      )
    ).toBeVisible()
  })

  test('5.5 Complete validate action', async () => {
    const validateResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.custom') && res.status() === 200
    )

    await page.getByRole('button', { name: 'Confirm' }).click()

    await validateResponse

    // Should redirect back to "Pending validation"-workqueue
    await expect(page.locator('#content-name')).toHaveText('Pending validation')

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })
})
