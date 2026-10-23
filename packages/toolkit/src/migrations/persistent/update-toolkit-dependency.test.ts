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
import { describe, expect, it } from 'vitest'
import { updateToolkitDependency } from './update-toolkit-dependency'

describe('updateToolkitDependency', () => {
  it('sets the toolkit dependency to the version, leaving the rest as written', () => {
    const packageJson = `{
  "name": "country-config",
  "dependencies": {
    "@opencrvs/toolkit":   "2.1.0",
    "date-fns": "2.1.0"
  }
}
`

    expect(updateToolkitDependency(packageJson, '2.2.0')).toBe(`{
  "name": "country-config",
  "dependencies": {
    "@opencrvs/toolkit":   "2.2.0",
    "date-fns": "2.1.0"
  }
}
`)
  })

  it('keeps the range in front of the version', () => {
    expect(
      updateToolkitDependency(
        '{ "devDependencies": { "@opencrvs/toolkit": "^2.1.0-rc.312fbd1" } }',
        '2.2.0'
      )
    ).toBe('{ "devDependencies": { "@opencrvs/toolkit": "^2.2.0" } }')
  })

  it('leaves a workspace dependency alone', () => {
    expect(
      updateToolkitDependency(
        '{ "dependencies": { "@opencrvs/toolkit": "workspace:*" } }',
        '2.2.0'
      )
    ).toBeUndefined()
  })

  it('has nothing to update when already on the version', () => {
    expect(
      updateToolkitDependency(
        '{ "dependencies": { "@opencrvs/toolkit": "2.2.0" } }',
        '2.2.0'
      )
    ).toBeUndefined()
  })

  it('has nothing to update without a toolkit dependency', () => {
    expect(
      updateToolkitDependency('{ "dependencies": {} }', '2.2.0')
    ).toBeUndefined()
  })
})
