import { expect, test, type Page } from '@playwright/test'

import { login, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test.describe.serial('Assign & Unassign', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('Login', async () => {
    await login(page)
  })

  test('Click on "Assign" from action menu', async () => {
    await page.getByText('Pending certification').click()

    const childName = `${declaration['child.name'].firstname} ${declaration['child.name'].surname}`
    await openRecordByTitle(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  test('Click on "Unassign" from action menu', async () => {
    await selectAction(page, 'Unassign')
    // Wait for the unassign modal to appear
    await page.getByRole('button', { name: 'Unassign', exact: true }).click()
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Not assigned'
    )
  })
})
