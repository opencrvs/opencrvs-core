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

import React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { FETCH_VIEW_RECORD_BY_COMPOSITION } from '@client/views/ViewRecord/query'
import { ViewRecord } from './ViewRecord'
import { useParams } from 'react-router'
import { Mock } from 'vitest'

describe('View Record for loading and success state', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    const mocks = [
      {
        request: {
          query: FETCH_VIEW_RECORD_BY_COMPOSITION,
          variables: {
            id: '4090df15-f4e5-4f16-ae7e-bb518129d493'
          }
        },
        result: {
          data: {
            fetchRegistrationForViewing: {
              __typename: 'DeathRegistration',
              id: '738245a2-5bc2-4295-b247-fd62e2160470',
              registration: {
                id: 'b32dc733-65cf-484b-a953-840406d79c73',
                informantType: 'SON',
                otherInformantType: null,
                contact: 'SPOUSE',
                contactRelationship: 'Mother',
                contactPhoneNumber: '+260774406403',
                duplicates: null,
                attachments: null,
                status: [
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T12:41:21.613Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c',
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T09:11:05.541Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T08:14:16.225Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T08:11:48.004Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T08:03:36.991Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T08:02:11.321Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T07:58:07.769Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T07:56:15.023Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T06:51:06.431Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  },
                  {
                    comments: null,
                    type: 'REGISTERED',
                    timestamp: '2022-11-01T05:44:53.553Z',
                    office: {
                      name: 'Ibombo District Office',
                      alias: ['Ibombo District Office'],
                      address: {
                        district: 'Ibombo District',
                        state: 'Central Province',
                        __typename: 'Address'
                      },
                      __typename: 'Location'
                    },
                    __typename: 'RegWorkflow'
                  }
                ],
                type: 'DEATH',
                trackingId: 'DHN9T01',
                registrationNumber: '2022DHN9T01',
                mosipAid: null,
                __typename: 'Registration'
              },
              history: [
                {
                  date: '2022-11-01T12:41:21.663+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T09:11:05.591+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T08:14:16.293+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T08:11:48.050+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T08:03:37.039+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T08:02:11.391+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T07:58:07.821+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T07:56:15.092+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T06:51:06.480+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T05:44:53.602+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T05:44:26.834+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-11-01T05:43:37.152+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:50:14.104+00:00',
                  action: 'ASSIGNED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:49:55.783+00:00',
                  action: 'ASSIGNED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:49:30.828+00:00',
                  action: 'ASSIGNED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:49:25.141+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:48:33.096+00:00',
                  action: 'VIEWED',
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:46:53.989+00:00',
                  action: null,
                  regStatus: 'REGISTERED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: {
                    data: 'data:image/png;base64,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',
                    type: 'image/png',
                    __typename: 'Signature'
                  },
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:46:53.878+00:00',
                  action: null,
                  regStatus: 'WAITING_VALIDATION',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:46:51.698+00:00',
                  action: 'ASSIGNED',
                  regStatus: 'DECLARED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '62b99cd98f113a700cc19a1a',
                    role: '',
                    systemRole: 'LOCAL_REGISTRAR',
                    name: [
                      {
                        firstNames: 'Kennedy',
                        familyName: 'Mweene',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                },
                {
                  date: '2022-10-31T13:46:49.762+00:00',
                  action: null,
                  regStatus: 'DECLARED',
                  dhis2Notification: false,
                  statusReason: null,
                  reason: null,
                  location: {
                    id: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    name: 'Ibombo',
                    __typename: 'Location'
                  },
                  office: {
                    id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
                    name: 'Ibombo District Office',
                    __typename: 'Location'
                  },
                  user: {
                    id: '635fd1c82ef11238798ad666',
                    role: 'LOCAL_LEADER',
                    systemRole: 'FIELD_AGENT',
                    name: [
                      {
                        firstNames: 'Terrance',
                        familyName: 'Rath',
                        use: 'en',
                        __typename: 'HumanName'
                      }
                    ],
                    avatar: null,
                    __typename: 'User'
                  },
                  signature: null,
                  comments: [],
                  input: [],
                  output: [],
                  certificates: null,
                  __typename: 'History'
                }
              ],
              deceased: {
                id: '5eed4c50-316f-4514-b9d4-037b6f59f70f',
                name: [
                  {
                    use: 'en',
                    firstNames: 'Orlo',
                    familyName: 'Streich',
                    __typename: 'HumanName'
                  }
                ],
                birthDate: '1948-10-22',
                age: 74,
                gender: 'female',
                maritalStatus: 'MARRIED',
                nationality: ['FAR'],
                identifier: [
                  {
                    id: '331641321',
                    type: 'NATIONAL_ID',
                    otherType: null,
                    __typename: 'IdentityType'
                  },
                  {
                    id: '420383876',
                    type: 'SOCIAL_SECURITY_NO',
                    otherType: null,
                    __typename: 'IdentityType'
                  },
                  {
                    id: '2022DHN9T01',
                    type: 'DEATH_REGISTRATION_NUMBER',
                    otherType: null,
                    __typename: 'IdentityType'
                  }
                ],
                deceased: {
                  deathDate: '2022-10-22',
                  __typename: 'Deceased'
                },
                address: [
                  {
                    type: 'PRIMARY_ADDRESS',
                    line: [
                      '480 Cordia Canyon',
                      '54835',
                      'URBAN',
                      '',
                      '',
                      'URBAN'
                    ],
                    district: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                    state: '7dbf10a9-23d9-4038-8b1c-9f6547ab4877',
                    city: 'Cronabury',
                    postalCode: '74454',
                    country: 'FAR',
                    __typename: 'Address'
                  }
                ],
                __typename: 'Person'
              },
              informant: {
                id: 'e94352fb-324b-478b-851c-a23a3d0cf4f8',
                relationship: 'SON',
                otherRelationship: null,
                individual: {
                  id: '0d1e8211-05f7-44b4-9abb-edc0acbec2c7',
                  identifier: [
                    {
                      id: '511393893',
                      type: 'NATIONAL_ID',
                      otherType: null,
                      __typename: 'IdentityType'
                    }
                  ],
                  name: [
                    {
                      use: 'en',
                      firstNames: 'Orlo',
                      familyName: 'Streich',
                      __typename: 'HumanName'
                    }
                  ],
                  nationality: ['FAR'],
                  occupation: 'consultant',
                  birthDate: '2002-10-28',
                  telecom: null,
                  address: [
                    {
                      type: 'PRIMARY_ADDRESS',
                      line: [
                        '894 Bartoletti Viaduct',
                        '77409-6468',
                        'URBAN',
                        '',
                        '',
                        'URBAN'
                      ],
                      district: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                      state: '7dbf10a9-23d9-4038-8b1c-9f6547ab4877',
                      city: 'Fort Maecester',
                      postalCode: '00890-0300',
                      country: 'FAR',
                      __typename: 'Address'
                    }
                  ],
                  __typename: 'Person'
                },
                __typename: 'RelatedPerson'
              },
              father: {
                id: 'cfe31e37-6f76-46db-b593-ee01f4ebe285',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Streich',
                    __typename: 'HumanName'
                  }
                ],
                __typename: 'Person'
              },
              mother: {
                id: '0cd67c8f-45b6-4d63-a639-ae880fec2c50',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Streich',
                    __typename: 'HumanName'
                  }
                ],
                __typename: 'Person'
              },
              spouse: null,
              medicalPractitioner: null,
              eventLocation: {
                id: '5a3e8d58-627e-4019-81ca-855671ccd222',
                type: 'DECEASED_USUAL_RESIDENCE',
                address: {
                  type: 'PRIMARY_ADDRESS',
                  line: ['', '', '', '', '', ''],
                  district: 'b09122df-81f8-41a0-b5c6-68cba4145cab',
                  state: '7dbf10a9-23d9-4038-8b1c-9f6547ab4877',
                  city: null,
                  postalCode: null,
                  country: 'FAR',
                  __typename: 'Address'
                },
                __typename: 'Location'
              },
              questionnaire: null,
              mannerOfDeath: 'NATURAL_CAUSES',
              causeOfDeathEstablished: 'true',
              causeOfDeathMethod: 'PHYSICIAN',
              causeOfDeath: 'Natural cause',
              deathDescription: null,
              maleDependentsOfDeceased: 3,
              femaleDependentsOfDeceased: 1
            }
          }
        }
      }
    ]
    component = await createTestComponent(<ViewRecord />, {
      store,
      history,
      graphqlMocks: mocks
    })
    ;(useParams as Mock).mockImplementation(() => ({
      declarationId: '4090df15-f4e5-4f16-ae7e-bb518129d493'
    }))
  })

  it('Render loading state properly ', async () => {
    expect(component.exists('LoadingState')).toBeTruthy()
  })

  it('Render review section properly ', async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    component.update()
    expect(component.exists('ReviewSectionComp')).toBeTruthy()
  })
})

describe('View Record error state', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()
    component = await createTestComponent(<ViewRecord />, {
      store,
      history
    })
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    component.update()
  })

  it('Render error state properly ', async () => {
    expect(component.exists('GenericErrorToast')).toBeTruthy()
  })
})
