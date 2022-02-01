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
import {
  detectDuplicates,
  buildQuery,
  createStatusHistory,
  IBirthCompositionBody
} from '@search/elasticsearch/utils'
import {
  mockSearchResponse,
  mockCompositionBody,
  mockBirthFhirBundle,
  mockUserModelResponse,
  mockLocationResponse,
  mockFacilityResponse,
  mockTaskBirthCorrectionBundle
} from '@search/test/utils'
import { searchComposition } from '@search/elasticsearch/dbhelper'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

jest.mock('@search/elasticsearch/dbhelper.ts')

describe('elastic search utils', () => {
  it('should return an array of duplicate identifiers for a composition', async () => {
    ;(searchComposition as jest.Mock).mockReturnValue(mockSearchResponse)
    const duplicates = await detectDuplicates(
      'c79e8d62-335e-458d-9fcc-45ec5836c404',
      mockCompositionBody
    )
    expect(duplicates[0]).toEqual('c99e8d62-335e-458d-9fcc-45ec5836c404')
  })

  it('should build the search query for a composition', async () => {
    const query = await buildQuery(mockCompositionBody)
    expect(query.bool.must).toHaveLength(4)
    expect(query.bool.should).toHaveLength(8)
  })

  it('should return appropriate history with facility name for notifications', async () => {
    fetch.mockResponses(
      [JSON.stringify(mockUserModelResponse), { status: 200 }],
      [JSON.stringify(mockLocationResponse), { status: 200 }],
      [JSON.stringify(mockFacilityResponse), { status: 200 }]
    )
    const mockNotificationBody = {
      compositionId: '9c0dde8d-65b2-49dd-8b7e-5dd0c7c63779',
      compositionType: 'birth-notification',
      type: 'IN_PROGRESS',
      updatedBy: '489b76cf-6b58-4b0d-96ba-caa1271f787b',
      eventLocationId: '489b76cf-6b58-4b0d-96ba-caa1271f787c',
      operationHistories: []
    }
    await createStatusHistory(
      mockNotificationBody,
      mockBirthFhirBundle.entry[1].resource as fhir.Task,
      'Bearer abc'
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
          operationType: 'REGISTERED',
          operatorRole: 'LOCAL_REGISTRAR'
        }
      ]
    }

    await createStatusHistory(
      mockNotificationBody,
      mockBirthFhirBundle.entry[1].resource as fhir.Task,
      'Bearer abc'
    )
    expect(mockNotificationBody.operationHistories.length).toEqual(1)
  })

  it('should create correction data in operation history when requested for correction', async () => {
    fetch.mockResponses(
      [JSON.stringify(mockUserModelResponse), { status: 200 }],
      [JSON.stringify(mockLocationResponse), { status: 200 }],
      [JSON.stringify(mockFacilityResponse), { status: 200 }]
    )
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
    await createStatusHistory(
      compositionBody,
      mockTaskBirthCorrectionBundle.entry[0].resource,
      {}
    )

    expect(compositionBody).toHaveProperty('operationHistories')
    expect(compositionBody.operationHistories).toHaveLength(2)
    expect(compositionBody.operationHistories[1]).toHaveProperty('correction')
    expect(compositionBody.operationHistories[1].correction).toHaveLength(1)
  })
})
