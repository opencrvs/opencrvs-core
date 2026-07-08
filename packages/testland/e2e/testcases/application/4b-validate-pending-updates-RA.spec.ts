import { expect, test, type Page } from '@playwright/test'

import { login, getToken, triggerDeclarationAction } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  navigateToWorkqueue,
  selectAction
} from '../../utils'
import {
  getRowByTitle,
  openRecordByTitle
} from '../print-certificate/birth/helpers'
import { faker } from '@faker-js/faker'

test.describe.serial('4(b) Validate "Pending updates"-workqueue for RO', () => {
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

  test('4.0.1 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('4.0.2 Navigate to record audit', async () => {
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
  })

  test('4.0.3 Reject a declaration', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Reject')

    await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

    await page.getByRole('button', { name: 'Send For Update' }).click()
  })

  test('4.1 Go to "Pending updates"-workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await page.getByText('Pending updates').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending updates'
    )
  })

  test('4.2 validate the list', async () => {
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

  test('4.3 Click a name', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))

    // User should navigate to record audit page
    await expectInUrl(
      page,
      `events/${eventId}?backTo=/workqueue/pending-updates`
    )
  })

  test('4.4 Click Edit -action', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Edit')
  })

  test('4.5 Complete declare with edits action', async () => {
    await page.getByTestId('change-button-child.weightAtBirth').click()
    await page.getByTestId('number__child____weightAtBirth').fill('2.6')
    await page.getByRole('button', { name: 'Go to review' }).click()

    await triggerDeclarationAction(page, 'Declare with edits')

    // Should redirect back to "Pending updates"-workqueue
    await expect(page.locator('#content-name')).toHaveText('Pending updates')

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })

  test('4.6 Assert record has correct flags', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
    await expect(page.getByTestId('flags-value')).not.toHaveText(
      'Edit in progress'
    )
  })
})
