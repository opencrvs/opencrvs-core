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
import { createMemoryRouter } from 'react-router-dom'
import { routesConfig } from '@login/App'
import { getBasename } from '@login/utils/basename'

describe('getBasename', () => {
  it('is "/" when the app is served from the root of its host', () => {
    expect(getBasename('https://login.example.org/')).toBe('/')
  })

  it('has no trailing slash when the app is served from a path', () => {
    expect(getBasename('https://example.org/login/')).toBe('/login')
  })

  it.each(['/login', '/login/', '/login/forgotten-item'])(
    'lets the router match %s under the base path',
    (path) => {
      const router = createMemoryRouter(routesConfig, {
        basename: getBasename('https://example.org/login/'),
        initialEntries: [path]
      })

      expect(router.state.errors).toBeNull()
      expect(router.state.matches.length).toBeGreaterThan(0)
    }
  )
})
