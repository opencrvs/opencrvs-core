import { test, expect } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { login } from '../../helpers'

const testCases = [
  {
    credential: CREDENTIALS.HOSPITAL_OFFICIAL,
    hasSearch: true
  },
  {
    credential: CREDENTIALS.REGISTRATION_OFFICER,
    hasSearch: true
  },
  {
    credential: CREDENTIALS.REGISTRAR,
    hasSearch: true
  },
  {
    credential: CREDENTIALS.REGISTRAR_GENERAL,
    hasSearch: true
  },
  {
    credential: CREDENTIALS.NATIONAL_SYSTEM_ADMIN,
    hasSearch: false
  },
  {
    credential: CREDENTIALS.LOCAL_SYSTEM_ADMIN,
    hasSearch: false
  },
  {
    credential: CREDENTIALS.PERFORMANCE_MANAGER,
    hasSearch: false
  }
]

test.describe('Search bar should be visible only if the user has search scope', () => {
  for (const { credential, hasSearch } of testCases) {
    test(`${credential} ${hasSearch ? 'has' : 'does not have'} search scope`, async ({
      page
    }) => {
      await login(page, credential)

      await expect(page.getByText('Farajaland CRS')).toBeVisible({
        timeout: 30_000
      })

      if (hasSearch) {
        await expect(page.locator('#searchText')).toBeVisible()
      } else {
        await expect(page.locator('#searchText')).not.toBeVisible()
      }
    })
  }
})
