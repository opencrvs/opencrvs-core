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

import { UUID } from '../uuid'
import { SavedPractitioner } from '../fhir'

const defaultSavedPractitioner = {
  resourceType: 'Practitioner',
  identifier: [],
  telecom: [
    {
      system: 'phone',
      value: '0933333333'
    },
    {
      system: 'email',
      value: ''
    }
  ],
  name: [
    {
      use: 'en',
      family: 'Mweene',
      given: ['Kennedy']
    }
  ],
  meta: {
    lastUpdated: '2024-05-30T13:12:05.574+00:00',
    versionId: 'dd7a0728-575e-4592-bb87-28996f498ef8'
  },
  _transforms: {
    meta: {
      lastUpdated: '2024-05-30T13:12:05.574Z'
    }
  },
  _request: {
    method: 'POST'
  },
  id: '93e34962-cef1-446a-985f-ad0e46732939' as UUID
}

export function savedPractitioner(
  overrides = {} as Partial<SavedPractitioner>
) {
  return { ...defaultSavedPractitioner, ...overrides } as SavedPractitioner
}
