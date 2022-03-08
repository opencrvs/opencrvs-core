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
import { createServer } from '@metrics/server'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as influx from '@metrics/influxdb/client'

const clearPoints = influx.query as jest.Mock

const response = [
  {
    measurement: 'applications_started',
    tags: {
      eventType: 'BIRTH',
      locationLevel5: 'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155',
      locationLevel4: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      locationLevel3: 'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba',
      locationLevel2: 'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    },
    fields: {
      role: 'FIELD_AGENT',
      compositionId: '0299daa0-fa97-439b-92ed-652d7db186c7'
    },
    timestamp: '1587384348363000000'
  },
  {
    measurement: 'applications_started',
    tags: {
      eventType: 'BIRTH',
      locationLevel5: 'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155',
      locationLevel4: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      locationLevel3: 'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba',
      locationLevel2: 'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    },
    fields: {
      role: 'FIELD_AGENT',
      compositionId: 'ca09dfa9-9e31-40ed-8aa6-9446b4ceb71a'
    },
    timestamp: '1587384430106000000'
  },
  {
    measurement: 'applications_started',
    tags: {
      eventType: 'BIRTH',
      locationLevel5: 'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155',
      locationLevel4: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      locationLevel3: 'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba',
      locationLevel2: 'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    },
    fields: {
      role: 'FIELD_AGENT',
      compositionId: '1a0dbdfd-550f-4113-ac23-e650596c7bea'
    },
    timestamp: '1587384453470000000'
  },
  {
    measurement: 'applications_started',
    tags: {
      eventType: 'BIRTH',
      locationLevel5: 'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155',
      locationLevel4: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      locationLevel3: 'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba',
      locationLevel2: 'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    },
    fields: {
      role: 'FIELD_AGENT',
      compositionId: '9867aaef-b994-4744-b5b3-abdd3f520793'
    },
    timestamp: '1587384532791000000'
  },
  {
    measurement: 'applications_started',
    tags: {
      eventType: 'BIRTH',
      locationLevel5: 'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155',
      locationLevel4: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      locationLevel3: 'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba',
      locationLevel2: 'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    },
    fields: {
      role: 'FIELD_AGENT',
      compositionId: 'b25ca75b-af0a-4cf4-94a8-359d1a7e190f'
    },
    timestamp: '1587384621467000000'
  },
  {
    measurement: 'applications_started',
    tags: {
      eventType: 'BIRTH',
      locationLevel5: 'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155',
      locationLevel4: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      locationLevel3: 'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba',
      locationLevel2: 'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    },
    fields: {
      role: 'FIELD_AGENT',
      compositionId: 'b8779830-49ca-48ed-8a21-fd43121e65ce'
    },
    timestamp: '1587384661428000000'
  }
]

describe('verify applicationsStarted handler', () => {
  let server: any
  const token = jwt.sign(
    { scope: ['declare'] },
    readFileSync('../auth/test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
    }
  )

  beforeEach(() => {
    jest.clearAllMocks()
    const {
      fetchAllFromSearch,
      fetchPractitionerRole,
      fetchParentLocationByLocationID
    }: {
      fetchAllFromSearch: jest.Mock
      fetchPractitionerRole: jest.Mock
      fetchParentLocationByLocationID: jest.Mock
    } = require('@metrics/api')

    fetchAllFromSearch.mockResolvedValueOnce({
      body: {
        took: 19,
        timed_out: false,
        _shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
        hits: {
          total: { value: 6 },
          max_score: null,
          hits: [
            {
              _index: 'ocrvs',
              _type: 'compositions',
              _id: '0299daa0-fa97-439b-92ed-652d7db186c7',
              _score: null,
              _source: {
                event: 'Birth',
                createdAt: '1587384348363',
                operationHistories: [
                  {
                    operatedOn: '2020-04-20T12:05:30.001Z',
                    operatorFirstNames: 'Shakib',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Al Hasan',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'DECLARED',
                    operatorRole: 'FIELD_AGENT'
                  },
                  {
                    operatedOn: '2020-04-20T12:05:48.163Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'WAITING_VALIDATION',
                    operatorRole: 'LOCAL_REGISTRAR'
                  },
                  {
                    operatedOn: '2020-04-20T12:05:48.163Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'REGISTERED',
                    operatorRole: 'LOCAL_REGISTRAR'
                  }
                ],
                childFamilyName: 'Spivak',
                childFamilyNameLocal: 'স্পিভক',
                childDoB: '2018-10-17',
                gender: 'female',
                eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
                motherFamilyName: 'Begum',
                motherFamilyNameLocal: 'বেগম',
                motherDoB: '1900-07-08',
                motherIdentifier: '14982808347893336',
                informantFamilyName: 'Begum',
                informantFamilyNameLocal: 'বেগম',
                contactNumber: '+8801529148197',
                type: 'REGISTERED',
                dateOfApplication: '2020-04-20T12:05:48.163Z',
                trackingId: 'BYW6MFW',
                applicationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
                compositionType: 'birth-application',
                createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
                updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
                modifiedAt: '1587384350751',
                registrationNumber: '20187210411000112'
              },
              sort: [1587384348163]
            },
            {
              _index: 'ocrvs',
              _type: 'compositions',
              _id: 'ca09dfa9-9e31-40ed-8aa6-9446b4ceb71a',
              _score: null,
              _source: {
                event: 'Birth',
                createdAt: '1587384430106',
                operationHistories: [
                  {
                    operatedOn: '2020-04-20T12:06:49.935Z',
                    operatorFirstNames: 'Shakib',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Al Hasan',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'DECLARED',
                    operatorRole: 'FIELD_AGENT'
                  },
                  {
                    operatedOn: '2020-04-20T12:07:10.000Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'WAITING_VALIDATION',
                    operatorRole: 'LOCAL_REGISTRAR'
                  },
                  {
                    operatedOn: '2020-04-20T12:07:10.000Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'REGISTERED',
                    operatorRole: 'LOCAL_REGISTRAR'
                  }
                ],
                childFirstNames: 'Maruf',
                childFamilyName: 'Hossain',
                childFirstNamesLocal: 'মারুফ',
                childFamilyNameLocal: 'হোসাইন',
                childDoB: '1994-10-22',
                gender: 'male',
                eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
                motherFirstNames: 'Habiba',
                motherFamilyName: 'Aktar',
                motherFirstNamesLocal: 'হাবিবা',
                motherFamilyNameLocal: 'আক্তার',
                motherDoB: '1971-10-23',
                motherIdentifier: '19922613235317496',
                fatherFirstNames: 'Borhan',
                fatherFamilyName: 'Uddin',
                fatherFirstNamesLocal: 'বোরহান',
                fatherFamilyNameLocal: 'উদ্দিন',
                fatherDoB: '1966-08-01',
                fatherIdentifier: '19988273235317496',
                informantFirstNames: 'Habiba',
                informantFamilyName: 'Aktar',
                informantFirstNamesLocal: 'হাবিবা',
                informantFamilyNameLocal: 'আক্তার',
                contactNumber: '+8801526972106',
                type: 'REGISTERED',
                dateOfApplication: '2020-04-20T12:07:10.000Z',
                trackingId: 'BPWW3PW',
                applicationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
                compositionType: 'birth-application',
                createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
                updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
                modifiedAt: '1587384432456',
                registrationNumber: '19947210411000113'
              },
              sort: [1587384430000]
            },
            {
              _index: 'ocrvs',
              _type: 'compositions',
              _id: '1a0dbdfd-550f-4113-ac23-e650596c7bea',
              _score: null,
              _source: {
                event: 'Birth',
                createdAt: '1587384453470',
                operationHistories: [
                  {
                    operatedOn: '2020-04-20T12:07:33.230Z',
                    operatorFirstNames: 'Shakib',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Al Hasan',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'DECLARED',
                    operatorRole: 'FIELD_AGENT'
                  },
                  {
                    operatedOn: '2020-04-20T12:07:49.162Z',
                    operatorFirstNames: 'Mohammad',
                    rejectReason: 'other',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    rejectComment:
                      'Lack of information, please notify informant about it.',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'REJECTED',
                    operatorRole: 'LOCAL_REGISTRAR'
                  }
                ],
                childFamilyName: 'Chowdhury',
                childFamilyNameLocal: 'চৌধুরী',
                childDoB: '1991-10-22',
                gender: 'male',
                eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
                motherFamilyName: 'Aktar',
                motherFamilyNameLocal: 'আক্তার',
                motherDoB: '1971-10-23',
                motherIdentifier: '19988010143317496',
                informantFamilyName: 'Aktar',
                informantFamilyNameLocal: 'আক্তার',
                contactNumber: '+8801526972106',
                type: 'REJECTED',
                dateOfApplication: '2020-04-20T12:07:33.230Z',
                trackingId: 'B5DU8KU',
                applicationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
                compositionType: 'birth-application',
                createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
                updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
                rejectReason: 'other',
                modifiedAt: '1587384469376',
                rejectComment:
                  'Lack of information, please notify informant about it.'
              },
              sort: [1587384453230]
            },
            {
              _index: 'ocrvs',
              _type: 'compositions',
              _id: '9867aaef-b994-4744-b5b3-abdd3f520793',
              _score: null,
              _source: {
                event: 'Birth',
                createdAt: '1587384532791',
                operationHistories: [
                  {
                    operatedOn: '2020-04-20T12:08:52.456Z',
                    operatorFirstNames: 'Shakib',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Al Hasan',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'DECLARED',
                    operatorRole: 'FIELD_AGENT'
                  },
                  {
                    operatedOn: '2020-04-20T12:09:16.255Z',
                    operatorFirstNames: 'Mohammad',
                    rejectReason: 'other',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    rejectComment:
                      'Lack of information, please notify informant about it.',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'REJECTED',
                    operatorRole: 'LOCAL_REGISTRAR'
                  }
                ],
                childFirstNames: 'Tahmid',
                childFamilyName: 'Rahman',
                childFirstNamesLocal: 'তাহ্মিদ',
                childFamilyNameLocal: 'রহমান',
                childDoB: '1989-01-01',
                gender: 'male',
                eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
                motherFirstNames: 'Namisa',
                motherFamilyName: 'Begum',
                motherFirstNamesLocal: 'নমিসা',
                motherFamilyNameLocal: 'বেগম',
                motherDoB: '1961-12-02',
                motherIdentifier: '19988010143317496',
                fatherFirstNames: 'Hamidur',
                fatherFamilyName: 'Rahman',
                fatherFirstNamesLocal: 'হামিদুর',
                fatherFamilyNameLocal: 'রহমান',
                fatherDoB: '1959-05-01',
                fatherIdentifier: '19988010143317496',
                informantFirstNames: 'Namisa',
                informantFamilyName: 'Begum',
                informantFirstNamesLocal: 'নমিসা',
                informantFamilyNameLocal: 'বেগম',
                contactNumber: '+8801526972106',
                type: 'REJECTED',
                dateOfApplication: '2020-04-20T12:08:52.456Z',
                trackingId: 'BQOPG9I',
                applicationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
                compositionType: 'birth-application',
                createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
                updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
                rejectReason: 'other',
                modifiedAt: '1587384556491',
                rejectComment:
                  'Lack of information, please notify informant about it.'
              },
              sort: [1587384532456]
            },
            {
              _index: 'ocrvs',
              _type: 'compositions',
              _id: 'b25ca75b-af0a-4cf4-94a8-359d1a7e190f',
              _score: null,
              _source: {
                event: 'Birth',
                createdAt: '1587384621467',
                operationHistories: [
                  {
                    operatedOn: '2020-04-20T12:10:21.368Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'WAITING_VALIDATION',
                    operatorRole: 'LOCAL_REGISTRAR'
                  },
                  {
                    operatedOn: '2020-04-20T12:10:21.368Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'REGISTERED',
                    operatorRole: 'LOCAL_REGISTRAR'
                  }
                ],
                childFirstNames: 'Maruf',
                childFamilyName: 'Hossain',
                childFirstNamesLocal: 'মারুফ',
                childFamilyNameLocal: 'হোসাইন',
                childDoB: '1994-10-22',
                gender: 'male',
                eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
                motherFirstNames: 'Habiba',
                motherFamilyName: 'Aktar',
                motherFirstNamesLocal: 'হাবিবা',
                motherFamilyNameLocal: 'আক্তার',
                motherDoB: '1971-10-23',
                motherIdentifier: '19988010143317496',
                fatherFirstNames: 'Borhan',
                fatherFamilyName: 'Uddin',
                fatherFirstNamesLocal: 'বোরহান',
                fatherFamilyNameLocal: 'উদ্দিন',
                fatherDoB: '1966-08-01',
                fatherIdentifier: '19988010143317496',
                informantFirstNames: 'Habiba',
                informantFamilyName: 'Aktar',
                informantFirstNamesLocal: 'হাবিবা',
                informantFamilyNameLocal: 'আক্তার',
                contactNumber: '+8801526972106',
                type: 'REGISTERED',
                dateOfApplication: '2020-04-20T12:10:21.368Z',
                trackingId: 'BEDYGYJ',
                applicationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
                compositionType: 'birth-application',
                createdBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
                updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
                relatesTo: ['ca09dfa9-9e31-40ed-8aa6-9446b4ceb71a'],
                modifiedAt: '1587384624163',
                registrationNumber: '19947210411000114'
              },
              sort: [1587384621368]
            },
            {
              _index: 'ocrvs',
              _type: 'compositions',
              _id: 'b8779830-49ca-48ed-8a21-fd43121e65ce',
              _score: null,
              _source: {
                event: 'Birth',
                createdAt: '1587384661428',
                operationHistories: [
                  {
                    operatedOn: '2020-04-20T12:10:46.015Z',
                    operatorFirstNames: 'Shakib',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Al Hasan',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'DECLARED',
                    operatorRole: 'FIELD_AGENT'
                  },
                  {
                    operatedOn: '2020-04-20T12:11:01.315Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'WAITING_VALIDATION',
                    operatorRole: 'LOCAL_REGISTRAR'
                  },
                  {
                    operatedOn: '2020-04-20T12:11:01.315Z',
                    operatorFirstNames: 'Mohammad',
                    operatorFamilyNameLocale: '',
                    operatorFamilyName: 'Ashraful',
                    operatorFirstNamesLocale: '',
                    operatorOfficeName: 'Baniajan Union Parishad',
                    operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                    operationType: 'REGISTERED',
                    operatorRole: 'LOCAL_REGISTRAR'
                  }
                ],
                childFamilyName: 'Bobita',
                childFamilyNameLocal: 'ববিতা',
                childDoB: '2018-08-01',
                gender: 'female',
                eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
                informantFamilyName: 'Begum',
                informantFamilyNameLocal: 'বেগম',
                contactNumber: '+8801526972106',
                type: 'REGISTERED',
                dateOfApplication: '2020-04-20T12:11:01.315Z',
                trackingId: 'BFY2ECB',
                applicationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
                compositionType: 'birth-application',
                createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
                updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
                modifiedAt: '1587384663775',
                registrationNumber: '20187210411000115'
              },
              sort: [1587384661315]
            }
          ]
        }
      },
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'content-length': '12943'
      },
      warnings: null,
      meta: {
        context: null,
        request: {
          params: {
            method: 'POST',
            path: '/ocrvs/_search',
            body: '{"query":{"match_all":{}},"sort":[{"dateOfApplication":"asc"}]}',
            querystring: '',
            headers: {
              'User-Agent':
                'elasticsearch-js/6.8.5 (darwin 18.7.0-x64; Node.js v13.5.0)',
              'Content-Type': 'application/json',
              'Content-Length': '63'
            },
            timeout: 30000
          },
          options: { ignore: [404], warnings: null },
          id: 269
        },
        name: 'elasticsearch-js',
        connection: {
          url: 'http://localhost:9200/',
          id: 'http://localhost:9200/',
          headers: {},
          deadCount: 0,
          resurrectTimeout: 0,
          _openRequests: 0,
          status: 'alive',
          roles: { master: true, data: true, ingest: true, ml: false }
        },
        attempts: 0,
        aborted: false
      }
    })
    fetchPractitionerRole.mockResolvedValue('FIELD_AGENT')
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/8f1aae72-2f90-4585-b853-e8c37f4be764'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/8f1aae72-2f90-4585-b853-e8c37f4be764'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/8f1aae72-2f90-4585-b853-e8c37f4be764'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/8f1aae72-2f90-4585-b853-e8c37f4be764'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/8f1aae72-2f90-4585-b853-e8c37f4be764'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/bfe8306c-0910-48fe-8bf5-0db906cf3155'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/8f1aae72-2f90-4585-b853-e8c37f4be764'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/f2ad28ad-e89a-4941-a1b3-6bb804f902ba'
    )
    fetchParentLocationByLocationID.mockResolvedValueOnce(
      'Location/2a3b9afa-5917-4fea-8370-a4f648b33748'
    )
  })

  it('returns ok for valid request', async () => {
    server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/generate',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual(response)
  })
})

describe('applicationsStarted errors', () => {
  let server: any
  const token = jwt.sign(
    { scope: ['declare'] },
    readFileSync('../auth/test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
    }
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Throws error on influx fault', async () => {
    clearPoints.mockRejectedValueOnce('error')
    server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/generate',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
  })
})
