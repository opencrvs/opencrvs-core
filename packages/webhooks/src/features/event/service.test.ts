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

import { createRequestSignature } from './service'
import { testBundle } from '@webhooks/features/test/utils'

describe('createRequestSignature', () => {
  it('generates valid request signature', async () => {
    const signature = createRequestSignature(
      'sha256',
      'ed2c149a-e581-4fd3-a692-8ae678c64c80',
      JSON.stringify(testBundle)
    )
    expect(signature).toBe(
      'sha256=cf99b406cd6c86bbc4badab4b15e001dc2d5ff1d84da12e32a6c104cd96b2197'
    )
  })
})
