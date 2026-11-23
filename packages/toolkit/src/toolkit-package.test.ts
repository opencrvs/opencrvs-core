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
import path from 'path'
import { describe, expect, it } from 'vitest'
import { getToolkitRoot, getToolkitVersion } from './toolkit-package'

describe('getToolkitRoot', () => {
  it("returns the directory of the toolkit's package.json", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(getToolkitRoot(), 'package.json'), 'utf-8')
    )
    expect(packageJson.name).toBe('@opencrvs/toolkit')
  })
})

describe('getToolkitVersion', () => {
  it("returns the version in the toolkit's package.json", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
    )
    expect(getToolkitVersion()).toBe(packageJson.version)
  })
})
