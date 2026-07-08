import { expect, test } from '@playwright/test'

import { login } from '../../helpers'
import { mockNetworkConditions } from '../../mock-network-conditions'

test('Can Change Workqueue offline', async ({ page }) => {
  await login(page)
  await expect(page.getByText('Farajaland CRS')).toBeVisible({
    timeout: 30000
  })
  await expect(page.locator('#content-name')).toHaveText('Assigned to you')
  await mockNetworkConditions(page, 'offline')
  await page.getByRole('button', { name: 'Pending certification' }).click()
  await expect(page.locator('#content-name')).toHaveText(
    'Pending certification'
  )
})
