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

import { user, window } from './TemplateConfig'

describe('Template Config Helpers', () => {
  describe('user', () => {
    it('should resolve user("name") to "$user.name"', () => {
      expect(user('name')).toBe('$user.name')
    })

    it('should resolve user("fullHonorificName") to "$user.fullHonorificName"', () => {
      expect(user('fullHonorificName')).toBe('$user.fullHonorificName')
    })

    it('should resolve user("device") to "$user.device"', () => {
      expect(user('device')).toBe('$user.device')
    })

    it('should resolve user("province") to "$user.province"', () => {
      expect(user('province')).toBe('$user.province')
    })

    it('should resolve user("district") to "$user.district"', () => {
      expect(user('district')).toBe('$user.district')
    })
  })

  describe('window', () => {
    it('should resolve window().location.get("href") to "$window.location.href"', () => {
      expect(window().location.get('href')).toBe('$window.location.href')
    })

    it('should resolve window().location.get("pathname") to "$window.location.pathname"', () => {
      expect(window().location.get('pathname')).toBe(
        '$window.location.pathname'
      )
    })

    it('should resolve window().location.get("hostname") to "$window.location.hostname"', () => {
      expect(window().location.get('hostname')).toBe(
        '$window.location.hostname'
      )
    })

    it('should resolve window().location.get("originPathname") to "$window.location.originPathname"', () => {
      expect(window().location.get('originPathname')).toBe(
        '$window.location.originPathname'
      )
    })
  })
})
