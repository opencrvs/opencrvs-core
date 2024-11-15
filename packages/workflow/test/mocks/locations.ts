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
import { SavedLocation } from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

export const office: SavedLocation = {
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
    reference: 'Location/0f7684aa-8c65-4901-8318-bf1e22c247cb'
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
    lastUpdated: '2023-11-29T07:02:38.868+00:00',
    versionId: 'f3012375-dbd1-4615-a1ef-e9982fa9a2ba'
  },
  id: 'ce73938d-a188-4a78-9d19-35dfd4ca6957' as UUID
}

export const district: SavedLocation = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/statistical-code',
      value: 'ADMIN_STRUCTURE_oEBf29y8JP8'
    },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'DISTRICT'
    }
  ],
  name: 'Ibombo',
  alias: ['Ibombo'],
  description: 'oEBf29y8JP8',
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/ed6195ff-0f83-4852-832e-dc9db07151ff'
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'ADMIN_STRUCTURE'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'jdn',
        display: 'Jurisdiction'
      }
    ]
  },
  extension: [],
  meta: {
    lastUpdated: '2023-11-29T07:02:38.392+00:00',
    versionId: '2a913694-3217-4981-9689-a9d4e020a2d5'
  },
  id: '0f7684aa-8c65-4901-8318-bf1e22c247cb' as UUID
}

export const state: SavedLocation = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/statistical-code',
      value: 'ADMIN_STRUCTURE_AWn3s2RqgAN'
    },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'STATE'
    }
  ],
  name: 'Central',
  alias: ['Central'],
  description: 'AWn3s2RqgAN',
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/0'
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'ADMIN_STRUCTURE'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'jdn',
        display: 'Jurisdiction'
      }
    ]
  },
  extension: [],
  meta: {
    lastUpdated: '2023-11-29T07:02:38.369+00:00',
    versionId: '6f8d39b4-0e82-461d-8c95-c470b34027e2'
  },
  id: 'ed6195ff-0f83-4852-832e-dc9db07151ff' as UUID
}
