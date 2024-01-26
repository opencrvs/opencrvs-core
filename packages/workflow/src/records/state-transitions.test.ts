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
// mock getPractitionerLocations function from
// packages/workflow/src/features/user/utils.ts
// so it always returns

import {
  Location,
  Practitioner,
  REGISTERED_RECORD,
  SavedBundleEntry,
  Task
} from '@opencrvs/commons/types'
import { toCorrectionRequested } from './state-transitions'

const practitioner = REGISTERED_RECORD.entry.find(
  (entry): entry is SavedBundleEntry<Practitioner> =>
    entry.resource.resourceType === 'Practitioner'
)!.resource

const practitionerRole = REGISTERED_RECORD.entry.find(
  (entry): entry is SavedBundleEntry<Practitioner> =>
    entry.resource.resourceType === 'PractitionerRole'
)

jest.mock('@workflow/features/registration/fhir/fhir-utils', () => {
  const actual = jest.requireActual(
    '@workflow/features/registration/fhir/fhir-utils'
  )

  return {
    ...actual,
    getFromFhir: (suffix: string) => {
      if (suffix.startsWith('/Location/')) {
        const id = suffix.replace('/Location/', '')

        return REGISTERED_RECORD.entry.find(
          (entry): entry is SavedBundleEntry<Location> =>
            entry.resource.id === id
        )?.resource
      }
      switch (suffix) {
        case '/PractitionerRole?practitioner=7dc24408-d409-4ec0-bd9d-4a5aa817dcab':
          return {
            entry: [practitionerRole]
          }

        default:
          // eslint-disable-next-line no-console
          console.log('request not handled:', suffix)
          throw new Error('Not implemented')
      }
    }
  }
})

describe('functions that take record from one state to another', () => {
  describe('* -> correction requested', () => {
    it('should be defined', async () => {
      const correctionRequested = await toCorrectionRequested(
        REGISTERED_RECORD,
        practitioner,
        {
          requester: 'MOTHER',
          hasShowedVerifiedDocument: true,
          noSupportingDocumentationRequired: true,
          attachments: [],
          payment: {
            type: 'MANUAL',
            amount: 100,
            outcome: 'COMPLETED',
            date: '2021-08-10T10:00:00.000Z'
          },
          location: {
            _fhirID: 'Location/61e07903-bf3c-4bd9-9b20-6cf0e3bb982c'
          },
          values: [],
          reason: 'OTHER',
          otherReason: 'Other reason',
          note: 'Note'
        },
        []
      )

      const newResources = correctionRequested.entry
        .map((entry) => entry.resource)
        .filter(
          (resource) =>
            !REGISTERED_RECORD.entry.find(
              (entry) => entry.resource.id === resource.id
            )
        )

      const changedResources = correctionRequested.entry
        .map((entry) => entry.resource)
        .filter(
          (resource) =>
            resource.id &&
            !REGISTERED_RECORD.entry.find(
              (entry) => entry.resource === resource
            )
        ) as unknown as Task[]

      const withoutDynamicIdentifiers = changedResources.map((task) => {
        return {
          ...task,
          lastModified: 'STATIC',
          encounter: {
            reference: 'STATIC'
          },
          extension: task.extension.map((extension) => {
            if (
              extension.url !==
              'http://opencrvs.org/specs/extension/paymentDetails'
            ) {
              return extension
            }
            return {
              ...extension,
              valueReference: {
                reference: 'STATIC'
              }
            }
          })
        }
      })

      expect(newResources).toMatchSnapshot('new resources')
      expect(withoutDynamicIdentifiers).toMatchSnapshot('changed resources')
    })
  })
})
