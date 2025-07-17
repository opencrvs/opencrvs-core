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

import { FullDocumentPath } from './documents'
describe('FullDocumentPath', () => {
  it('should transform a path without slash prefix to have slash prefix', () => {
    const result = FullDocumentPath.parse(
      'ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png'
    )
    expect(result).toBe('/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png')
  })

  it('should keep slash prefix if already present', () => {
    const result = FullDocumentPath.parse(
      '/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png'
    )
    expect(result).toBe('/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png')
  })
})
