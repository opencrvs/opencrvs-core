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
  Composition,
  Encounter,
  Location,
  Observation,
  Patient,
  Practitioner,
  PractitionerRole,
  RelatedPerson,
  SavedBundle,
  Task,
  TrackingID,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'
import { READY_FOR_REVIEW_BIRTH_RECORD } from './readyForReview'

export const VALIDATED_BIRTH_RECORD: SavedBundle<
  | Composition
  | Encounter
  | Patient
  | RelatedPerson
  | Task
  | Practitioner
  | PractitionerRole
  | Location
  | Observation
> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    ...READY_FOR_REVIEW_BIRTH_RECORD.entry.filter(
      (e) => e.resource.resourceType !== 'Task'
    ),
    {
      fullUrl:
        '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/4d67992c-ab35-4e26-a8b9-9447540cca00' as URLReference,
      resource: {
        resourceType: 'Task',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'abc@xyz.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 210764
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference:
                'Practitioner/4651d1cc-6072-4e34-bf20-b583f421a9f1' as `Practitioner/${UUID}`
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference:
                'Location/ce73938d-a188-4a78-9d19-35dfd4ca6957' as `Location/${UUID}`
            }
          }
        ],
        status: 'ready',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '7c3af302-08c9-41af-8701-92de9a71a3e4'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BQSQASX' as TrackingID
          }
        ],
        lastModified: '2023-11-30T12:36:27.043Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'VALIDATED'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        focus: {
          reference:
            'Composition/c8b8e843-c5e0-49b5-96d9-a702ddb46454' as `Composition/${UUID}`
        },
        meta: {
          lastUpdated: '2023-11-30T12:36:27.277+00:00',
          versionId: '4d67992c-ab35-4e26-a8b9-9447540cca00'
        },
        id: 'f00e742a-0900-488b-b7c1-9625d7b7e456' as UUID
      }
    }
  ]
}
