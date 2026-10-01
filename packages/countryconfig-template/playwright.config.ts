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
import { defineConfig, devices } from '@playwright/test'

// Let's Encrypt staging certificates are not publicly trusted
const ignoreHTTPSErrors = !!process.env.CI

/**
 * See https://playwright.dev/docs/test-configuration.
 * Run by the infrastructure repository's e2e.yml workflow after every deployment
 * to an environment that has E2E_ENABLED=true.
 */
export default defineConfig({
  testDir: './e2e',
  // Not *.spec.ts, so that vitest doesn't collect these
  testMatch: '**/*.e2e.ts',
  timeout: 90000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ignoreHTTPSErrors
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ignoreHTTPSErrors }
    }
  ]
})
