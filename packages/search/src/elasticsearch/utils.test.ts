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
  detectBirthDuplicates,
  createStatusHistory,
  IBirthCompositionBody
} from '@search/elasticsearch/utils'
import {
  mockSearchResponse,
  mockCompositionBody,
  mockBirthFhirBundle,
  mockUserModelResponse
} from '@search/test/utils'
import * as fetchAny from 'jest-fetch-mock'
import { searchForBirthDuplicates } from '@search/features/registration/deduplicate/service'
import { getTaskFromSavedBundle, SavedTask } from '@opencrvs/commons/types'

const fetch = fetchAny as any

jest.mock('@search/features/registration/deduplicate/service')
jest.mock('@search/elasticsearch/dbhelper.ts')

describe('elastic search utils', () => {
  it('should return an array of duplicate identifiers for a composition', async () => {
    ;(searchForBirthDuplicates as jest.Mock).mockReturnValue(
      mockSearchResponse.body.hits.hits
    )
    const duplicates = await detectBirthDuplicates(
      'c79e8d62-335e-458d-9fcc-45ec5836c404',
      mockCompositionBody
    )
    expect(duplicates[0].id).toEqual('c99e8d62-335e-458d-9fcc-45ec5836c404')
  })

  it('should return appropriate history with facility name for notifications', async () => {
    fetch.mockResponses([
      JSON.stringify(mockUserModelResponse),
      { status: 200 }
    ])
    const mockNotificationBody = {
      compositionId: 'c8b8e843-c5e0-49b5-96d9-a702ddb46454',
      compositionType: 'birth-notification',
      type: 'IN_PROGRESS',
      updatedBy: '4651d1cc-6072-4e34-bf20-b583f421a9f1',
      eventLocationId: '146251e9-df90-4068-82b0-27d8f979e8e2',
      operationHistories: []
    }
    await createStatusHistory(
      mockNotificationBody,
      getTaskFromSavedBundle(mockBirthFhirBundle),
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsInBlcmZvcm1hbmNlIiwiY2VydGlmeSIsImRlbW8iXSwiaWF0IjoxNzE0MTI1NjI4LCJleHAiOjE3MTQ3MzA0MjgsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2NjEzOWNjY2IyMTAwOTI3ZjY4OTJhNGYifQ.gQcNbMtCd3V96LRbw7buTSgk_wPkNYEepGhAaE0Z5fH4c1jNG4dn6Jm2J0QgvmEkm6cgPp240e9imT4pG3md7_gO9iwqXg84gn5cU9nhfF7Xi_pxbqDAbprBIB-1smxGOPGYy4LhgSydAa47XwaPLwtQRBoHQtsys13TH_ypw2SY0KQFJVm7OuAJiyvtJsQ6JA2a4oddRTPpbwqc3l-IEEESUktduMMFoHA4DmwHgIylVRKOB58NlxruV-YQRS78X99VBHCnq9f8aecW91dtvw9P_rcTihW8K1x5ua3GYw69sxn-KuJcBzydynp8IKEqCKaeNrtFu8TxMvamIOZTXg',
      mockBirthFhirBundle
    )
    expect(mockNotificationBody.operationHistories.length).toEqual(1)
  })

  it('should ignore when going to create invalid history', async () => {
    const mockNotificationBody = {
      compositionId: '9c0dde8d-65b2-49dd-8b7e-5dd0c7c63779',
      compositionType: 'birth-notification',
      type: 'REGISTERED',
      updatedBy: '489b76cf-6b58-4b0d-96ba-caa1271f787b',
      eventLocationId: '489b76cf-6b58-4b0d-96ba-caa1271f787c',
      operationHistories: [
        {
          operatedOn: '2020-11-23T12:01:15.600Z',
          operatorFirstNames: 'Mohammad',
          operatorFamilyNameLocale: '',
          operatorFamilyName: 'Ashraful',
          operatorFirstNamesLocale: '',
          operatorOfficeName: 'Baniajan Union Parishad',
          operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
          operationType: 'REGISTERED' as const,
          operatorRole: 'LOCAL_REGISTRAR'
        }
      ]
    }

    await createStatusHistory(
      mockNotificationBody,
      getTaskFromSavedBundle(mockBirthFhirBundle),
      'Bearer abc',
      mockBirthFhirBundle
    )
    expect(mockNotificationBody.operationHistories.length).toEqual(1)
  })

  it('should create correction data in operation history when requested for correction', async () => {
    fetch.mockResponses([
      JSON.stringify(mockUserModelResponse),
      { status: 200 }
    ])
    const compositionBody: IBirthCompositionBody = {
      ...mockCompositionBody,
      type: 'REQUESTED_CORRECTION',
      operationHistories: [
        {
          operatedOn: '2022-01-26T10:59:00.588Z',
          operatorFirstNames: 'Kennedy',
          rejectReason: '',
          operatorFamilyNameLocale: '',
          operatorFamilyName: 'Mweene',
          operatorFirstNamesLocale: '',
          rejectComment: '',
          operatorOfficeName: 'Lusaka DNRPC District Office',
          operatorOfficeAlias: ['Lusaka DNRPC District Office'],
          operationType: 'REGISTERED',
          operatorRole: 'LOCAL_REGISTRAR'
        }
      ]
    }
    const correctionTask: SavedTask = {
      ...getTaskFromSavedBundle(mockBirthFhirBundle),
      businessStatus: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/reg-status',
            code: 'REGISTERED'
          }
        ]
      },
      input: [
        {
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/action-type',
                code: 'update'
              }
            ]
          },
          valueCode: 'child',
          valueId: 'name',
          valueString: 'Old name'
        }
      ],
      output: [
        {
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/action-type',
                code: 'update'
              }
            ]
          },
          valueCode: 'child',
          valueId: 'name',
          valueString: 'New name'
        }
      ]
    }
    await createStatusHistory(
      compositionBody,
      correctionTask,
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsInBlcmZvcm1hbmNlIiwiY2VydGlmeSIsImRlbW8iXSwiaWF0IjoxNzE0MTI1NjI4LCJleHAiOjE3MTQ3MzA0MjgsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2NjEzOWNjY2IyMTAwOTI3ZjY4OTJhNGYifQ.gQcNbMtCd3V96LRbw7buTSgk_wPkNYEepGhAaE0Z5fH4c1jNG4dn6Jm2J0QgvmEkm6cgPp240e9imT4pG3md7_gO9iwqXg84gn5cU9nhfF7Xi_pxbqDAbprBIB-1smxGOPGYy4LhgSydAa47XwaPLwtQRBoHQtsys13TH_ypw2SY0KQFJVm7OuAJiyvtJsQ6JA2a4oddRTPpbwqc3l-IEEESUktduMMFoHA4DmwHgIylVRKOB58NlxruV-YQRS78X99VBHCnq9f8aecW91dtvw9P_rcTihW8K1x5ua3GYw69sxn-KuJcBzydynp8IKEqCKaeNrtFu8TxMvamIOZTXg',
      mockBirthFhirBundle
    )

    expect(compositionBody).toHaveProperty('operationHistories')
    expect(compositionBody.operationHistories).toHaveLength(2)
    expect(compositionBody.operationHistories?.[1]).toHaveProperty('correction')
    expect(compositionBody.operationHistories?.[1]?.correction).toHaveLength(1)
  })
})
