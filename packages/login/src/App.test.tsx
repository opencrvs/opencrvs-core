/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { createTestApp, wait } from '@login/tests/util'

describe('Login app step one', () => {
  let app: any
  beforeEach(async () => {
    const appBundle = await createTestApp()
    app = appBundle.app
    window.config = {
      AUTH_API_URL: 'http://localhost:4040/',
      CONFIG_API_URL: 'http://localhost:2021/',
      COUNTRY: 'far',
      LANGUAGES: 'en,fr',
      AVAILABLE_LANGUAGES_SELECT: 'en:English,fr:Français,bn:বাংলা',
      CLIENT_APP_URL: 'http://localhost:3000/',
      COUNTRY_CONFIG_URL: 'http://localhost:3040',
      PHONE_NUMBER_PATTERN: /^0(7|9)[0-9]{1}[0-9]{7}$/,
      SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
      LOGROCKET: 'opencrvs-foundation/opencrvs-farajaland'
    }
  })

  afterEach(() => {
    app.unmount()
  })

  it('renders a phone number and a password field on startup', async () => {
    expect(app.find('input')).toHaveLength(3)
  })

  it('fills credentials form', async () => {
    const { app } = await createTestApp()
    app
      .find('input#username')
      .simulate('change', { target: { value: 'kennedy.mweene' } })

    app.find('input#password').simulate('change', { target: { value: 'test' } })
  })
})
