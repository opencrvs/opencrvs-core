import { test, expect, Page } from '@playwright/test'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { getToken, login, switchEventTab } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureAssignedToUser } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'
import { formatV2ChildName } from '../birth/helpers'

test.describe
  .serial('History rows when Registrar registers a birth from scratch', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page)
  })
  test('Assign', async () => {
    await page.getByText('Pending certification').click()

    await openRecordByTitle(page, formatV2ChildName(declaration))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
  })
  test('validate Actions in history', async () => {
    await switchEventTab(page, 'Audit')
    const rows = page.locator('#listTable-task-history [id^="row_"]')

    const expectedActions = [
      'Assigned',
      'Declared',
      'Registered',
      'Unassigned',
      'Viewed',
      'Assigned'
    ]

    await expect(rows).toHaveCount(expectedActions.length)

    for (let i = 0; i < expectedActions.length; i++) {
      const actionCell = rows.nth(i).locator('span').first()
      await expect(actionCell).toHaveText(expectedActions[i])

      await actionCell.getByRole('button').click()

      const modal = page.getByTestId('event-history-modal')

      await expect(modal.getByRole('heading')).toHaveText(expectedActions[i])
      await modal.locator('#close-dialog').click()
    }
  })
})
