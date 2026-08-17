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

const TEST_TIMEOUT = 90000

const subdomains = ['register'] // TODO: Add more subdomains if needed
const insecureOrigins = subdomains.map(
  (subdomain) =>
    `--unsafely-treat-insecure-origin-as-secure=https://${subdomain}.${process.env.DOMAIN}`
)

const ignoreHTTPSErrors = process.env.CI ? true : false

const optInSuites = [
  { envVar: 'DASHBOARD_E2E', pattern: /testcases\/dashboard\// },
  { envVar: 'REGRESSION_E2E', pattern: /testcases\/qa-testrail-testcases\// }
]
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: TEST_TIMEOUT,
  testDir: './e2e/testcases',

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Don't retry. Fix the flaky ones. */
  retries: process.env.CI ? 3 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['playwright-ctrf-json-reporter', {}]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',
    /* Capture screenshot on failure */
    screenshot: 'on',
    /* Collect trace when the test failed. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    // Ignore HTTPS errors (like untrusted or self-signed certificates) during Playwright tests on CI
    // This is useful for Let's Encrypt staging certificates that aren't publicly trusted.
    ignoreHTTPSErrors
  },

  /*
   * Opt-in suites: excluded by default, only collected when their env var is
   * set to 'true'.
   * DASHBOARD_E2E is set by farajaland's deploy-and-e2e workflow.
   * REGRESSION_E2E is set by the PR flag: "Run regression e2e".
   */
  testIgnore: optInSuites
    .filter(({ envVar }) => process.env[envVar] !== 'true')
    .map(({ pattern }) => pattern),

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors,
        launchOptions: {
          args: process.env.CI
            ? [
                '--ignore-certificate-errors',
                '--ignore-ssl-errors',
                '--allow-running-insecure-content',
                '--disable-web-security',
                ...insecureOrigins
              ]
            : []
        }
      }
    }
  ]
})
