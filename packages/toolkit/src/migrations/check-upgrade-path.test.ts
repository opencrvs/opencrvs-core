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
import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  checkUpgradePath,
  findCountryConfigToolkitVersion,
  findMajorMinor
} from './check-upgrade-path'

describe('findMajorMinor', () => {
  it.each([
    ['2.1.0', { major: 2, minor: 1 }],
    ['^2.1.3', { major: 2, minor: 1 }],
    ['~2.2.0', { major: 2, minor: 2 }],
    ['2.2.0-rc.1', { major: 2, minor: 2 }]
  ])('reads %s', (version, expected) => {
    expect(findMajorMinor(version)).toEqual(expected)
  })

  it.each(['workspace:*', 'latest'])('finds none in %s', (version) => {
    expect(findMajorMinor(version)).toBeUndefined()
  })
})

describe('checkUpgradePath', () => {
  it('lets the previous minor through', () => {
    expect(checkUpgradePath('2.1.0', '2.2.0')).toEqual({ status: 'ok' })
  })

  it('lets the same minor through, for re-runs and patch releases', () => {
    expect(checkUpgradePath('2.2.0', '2.2.1')).toEqual({ status: 'ok' })
  })

  it('reads release candidates by their major.minor', () => {
    expect(checkUpgradePath('^2.1.4', '2.2.0-rc.7737766')).toEqual({
      status: 'ok'
    })
  })

  it('lets any minor of the previous major through to the next x.0', () => {
    expect(checkUpgradePath('2.7.1', '3.0.0')).toEqual({ status: 'ok' })
  })

  it('blocks skipping a minor, naming the version to upgrade to first', () => {
    const check = checkUpgradePath('2.0.2', '2.2.0')

    expect(check.status).toBe('blocked')
    expect(check).toHaveProperty(
      'message',
      expect.stringContaining('npx @opencrvs/toolkit@2.1 upgrade')
    )
  })

  it('blocks a country config newer than the toolkit', () => {
    const check = checkUpgradePath('2.3.0', '2.2.0')

    expect(check.status).toBe('blocked')
    expect(check).toHaveProperty(
      'message',
      expect.stringContaining('already on 2.3')
    )
  })

  it('cannot tell from a workspace dependency', () => {
    expect(checkUpgradePath('workspace:*', '2.2.0').status).toBe('unknown')
  })

  it('cannot tell without a toolkit dependency', () => {
    expect(checkUpgradePath(undefined, '2.2.0').status).toBe('unknown')
  })
})

describe('findCountryConfigToolkitVersion', () => {
  function countryConfigWith(packageJson: object) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'country-config-'))
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify(packageJson)
    )
    return dir
  }

  it('reads the toolkit from dependencies', () => {
    const dir = countryConfigWith({
      dependencies: { '@opencrvs/toolkit': '2.1.0' }
    })

    expect(findCountryConfigToolkitVersion(dir)).toBe('2.1.0')
  })

  it('reads the toolkit from devDependencies', () => {
    const dir = countryConfigWith({
      devDependencies: { '@opencrvs/toolkit': '^2.1.0' }
    })

    expect(findCountryConfigToolkitVersion(dir)).toBe('^2.1.0')
  })

  it('returns undefined without a package.json', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'country-config-'))

    expect(findCountryConfigToolkitVersion(dir)).toBeUndefined()
  })
})
