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
import { readFileSync } from 'fs'
import { join } from 'path'

const COUNTRY_LOGO_URL = '/api/countryconfig/content/country-logo'

// Storybook cannot render index.html, so LoadingScreen.interaction.stories.tsx does not test it
describe('Splash screen in index.html', () => {
  it('shows the country logo', () => {
    const html = readFileSync(join(__dirname, '../../index.html'), 'utf8')
    const document = new DOMParser().parseFromString(html, 'text/html')

    const logo = document.querySelector('#root img')

    expect(logo?.getAttribute('src')).toBe(COUNTRY_LOGO_URL)
  })
})
