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

import { ResourceIdentifier, SavedLocation } from '../fhir'
import { UUID } from '../uuid'
import { defaults } from 'lodash'

const defaultSavedLocation = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/internal-id',
      value: 'CRVS_OFFICE_JWMRGwDBXK'
    }
  ],
  name: 'Ibombo District Office',
  alias: ['Ibombo District Office'],
  status: 'active',
  mode: 'instance',
  partOf: {
    reference:
      'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as ResourceIdentifier
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'CRVS_OFFICE'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'bu',
        display: 'Building'
      }
    ]
  },
  meta: {
    lastUpdated: '2023-09-13T12:36:08.749+00:00',
    versionId: 'ebe887c3-35fd-4af3-9163-c4decf93797f'
  },
  id: 'e9e1b362-27c9-4ce1-82ad-57fe9d5650e4' as UUID
}

export function savedLocation(overrides = {} as Partial<SavedLocation>) {
  return defaults({}, overrides, defaultSavedLocation)
}
