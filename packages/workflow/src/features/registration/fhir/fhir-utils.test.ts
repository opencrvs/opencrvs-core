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

import { getSharedContactMsisdn } from '@workflow/features/registration/fhir/fhir-utils'
import { testFhirBundle } from '@workflow/test/utils'

describe('Verify getSharedContactMsisdn', () => {
  it('Returned shared contact number properly', async () => {
    const phoneNumber = await getSharedContactMsisdn(testFhirBundle)
    expect(phoneNumber).toEqual('+8801622688231')
  })
})
