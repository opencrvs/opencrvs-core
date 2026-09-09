/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { test, expect } from '@playwright/test'
import { CREDENTIALS } from '@e2e/support/constants'
import { login } from '@e2e/support/helpers'

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
