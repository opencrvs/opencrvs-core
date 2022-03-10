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
import { filterTaskExtensions } from '@workflow/features/task/fhir/utils'

describe('filterTaskExtensions()', () => {
  const extensions = [
    {
      url: 'test-url',
      valueString: 'DECLARED'
    },
    {
      url: 'test-url2',
      valueString: 'ARCHIVED'
    }
  ]

  it('should filter out the given extensions that do not match the given status', () => {
    const result = filterTaskExtensions(extensions, ['test-url'], 'ARCHIVED')
    expect(result.length).toBe(1)
    expect(result[0].url).toBe('test-url2')
  })

  it('should not filter out the given extensions that match the given status', () => {
    const result = filterTaskExtensions(extensions, ['test-url'], 'DECLARED')
    expect(result.length).toBe(2)
  })
})
