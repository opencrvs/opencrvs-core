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
import {
  PractitionerRole,
  SavedBundle,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

export const practitionerRoleBundle: SavedBundle<PractitionerRole> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d/_history/2f79ee2d-3b78-4c90-91d8-278e4a28caf7' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/4651d1cc-6072-4e34-bf20-b583f421a9f1'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'FIELD_AGENT'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/types',
                code: '[{"lang":"en","label":"Social Worker"},{"lang":"fr","label":"Travailleur social"}]'
              }
            ]
          }
        ],
        location: [
          {
            reference: 'Location/ce73938d-a188-4a78-9d19-35dfd4ca6957'
          },
          {
            reference: 'Location/0f7684aa-8c65-4901-8318-bf1e22c247cb'
          },
          {
            reference: 'Location/ed6195ff-0f83-4852-832e-dc9db07151ff'
          }
        ],
        meta: {
          lastUpdated: '2023-11-29T07:02:40.052+00:00',
          versionId: '566659dc-347a-4c6a-8516-606db3a95ffe'
        },
        id: 'f845d4fa-71fe-4d99-9f92-e5ed60838d1d' as UUID
      }
    }
  ]
}
