import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable , verifyTeamMembers } from '../birth/helpers'

test.describe.serial('7. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('7.1 Basic UI check', async () => {
    test('7.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Central Province Office'
      )

      await expect(
        page.getByText('Central', {
          exact: true
        })
      ).toBeVisible()
    })

    const team = [
      { name: 'Emmanuel Mayuka', role: 'Administrator' },
      { name: 'Mitchel Owen', role: 'Provincial Registrar' }
    ]

    test('7.1.1 Verify Team Members, Roles and their statuses', async () => {
      await verifyTeamMembers(page, team)
    })

    test('7.1.2 Verify team page member list', async () => {
      const members = ['Emmanuel Mayuka', 'Mitchel Owen']

      await verifyMembersClickable(page, members, 'Central Province Office')
    })
  })
})
