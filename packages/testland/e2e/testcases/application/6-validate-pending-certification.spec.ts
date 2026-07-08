import { expect, test, type Page } from '@playwright/test'

import { login, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'
import { ensureAssignedToUser, expectInUrl, selectAction } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test.describe.serial('6 Validate "Pending certification"-workqueue', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    eventId = res.eventId

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('6.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('6.1 Go to "Pending certification"-workqueue', async () => {
    await page.getByText('Pending certification').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending certification'
    )
  })

  test('6.2 validate the list', async () => {
    const button = page.getByRole('button', {
      name: formatV2ChildName(declaration)
    })

    const header = page.locator('div[class^="TableHeader"]')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Last updated',
      ''
    ])

    const row = button.locator('xpath=ancestor::*[starts-with(@id, "row_")]')
    const cells = row.locator(':scope > div')

    await expect(cells.nth(0)).toHaveText(formatV2ChildName(declaration))
    await expect(cells.nth(1)).toHaveText('Birth')
    await expect(cells.nth(2)).toHaveText(
      declaration['child.dob'].split('T')[0]
    )
  })

  test('6.4 Click a name', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await expectInUrl(
      page,
      `events/${eventId}?backTo=/workqueue/pending-certification`
    )
  })

  test('6.5 Click Print action', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Print')
    await expect(page.locator('#content-name')).toHaveText('Certify record')
    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/pages/collector?backTo=/workqueue/pending-certification`
    )
  })
})
