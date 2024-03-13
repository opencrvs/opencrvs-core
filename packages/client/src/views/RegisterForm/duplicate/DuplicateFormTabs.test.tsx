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
import * as React from 'react'
import {
  createTestComponent,
  getReviewFormFromStore,
  createTestStore
} from '@client/tests/util'
import { RegisterForm } from '@client/views/RegisterForm/RegisterForm'
import { ReactWrapper } from 'enzyme'
import {
  createReviewDeclaration,
  storeDeclaration,
  setInitialDeclarations
} from '@client/declarations'
import { v4 as uuid } from 'uuid'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@opencrvs/client/src/navigation/routes'
import { Event } from '@client/utils/gateway'
import * as profileSelectors from '@client/profile/profileSelectors'
import { vi } from 'vitest'
import { ViewRecordQueries } from '@client/views/ViewRecord/query'
import { waitForElement } from '@client/tests/wait-for-element'

const viewRecordMock = {
  data: {
    fetchRegistrationForViewing: {
      __typename: 'BirthRegistration',
      id: 'e47ad861-0eec-42a2-b4e0-19c11e4aeca1',
      registration: {
        id: '9f2a0739-ac9f-4778-a684-b1cc5a564b9f',
        informantType: 'MOTHER',
        otherInformantType: null,
        contact: 'MOTHER',
        contactRelationship: null,
        contactPhoneNumber: '+260751515151',
        duplicates: null,
        attachments: [
          {
            data: '/ocrvs/879a9329-8b0b-4ad9-bdd3-82ae50c9fc09.jpg',
            type: 'NOTIFICATION_OF_BIRTH',
            contentType: 'image/jpeg',
            subject: 'CHILD',
            __typename: 'Attachment'
          },
          {
            data: '/ocrvs/ac71b6d8-d811-467b-b858-17a00f983021.png',
            type: 'BIRTH_CERTIFICATE',
            contentType: 'image/png',
            subject: 'MOTHER',
            __typename: 'Attachment'
          }
        ],
        status: [
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T10:39:26.417Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:29:17.946Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:13:07.616Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:09:15.086Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:08:21.476Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:07:21.923Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:04:34.071Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:02:25.046Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T07:01:28.050Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          },
          {
            comments: null,
            type: 'DECLARED',
            timestamp: '2023-01-26T06:58:08.013Z',
            office: {
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              address: null,
              __typename: 'Location'
            },
            __typename: 'RegWorkflow'
          }
        ],
        type: 'BIRTH',
        trackingId: 'BGVLQSH',
        registrationNumber: null,
        mosipAid: null,
        __typename: 'Registration'
      },
      history: [
        {
          date: '2023-01-26T10:39:26.463+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:29:18.029+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:13:07.672+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:09:15.118+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:08:21.514+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:07:21.958+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:04:34.105+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:02:25.078+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T07:01:28.088+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T06:58:08.048+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T06:51:55.459+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T06:50:49.329+00:00',
          action: 'ASSIGNED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T06:50:10.541+00:00',
          action: 'VIEWED',
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44094',
            type: '',
            role: 'LOCAL_REGISTRAR',
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
          date: '2023-01-26T06:48:31.365+00:00',
          action: null,
          regStatus: 'DECLARED',
          dhis2Notification: false,
          statusReason: null,
          reason: null,
          location: {
            id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            name: 'Ibombo',
            __typename: 'Location'
          },
          office: {
            id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
            name: 'Ibombo District Office',
            __typename: 'Location'
          },
          user: {
            id: '63b3f284452f2e40afa44092',
            type: 'SOCIAL_WORKER',
            role: 'FIELD_AGENT',
            name: [
              {
                firstNames: 'Kalusha',
                familyName: 'Bwalya',
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
      _fhirIDMap: {
        composition: 'e47ad861-0eec-42a2-b4e0-19c11e4aeca1',
        encounter: 'f8508ceb-22f1-4245-be42-12f9648e91a2',
        eventLocation: 'abf358df-09c2-40a5-96cb-7e756ac1d748',
        observation: {}
      },
      child: {
        id: '35056052-6aa0-46d8-a7b7-0845a0215f68',
        name: [
          {
            use: 'en',
            firstNames: 'Edgar',
            familyName: 'Samo',
            __typename: 'HumanName'
          }
        ],
        birthDate: '1955-12-12',
        gender: 'male',
        __typename: 'Person'
      },
      informant: {
        id: '67d4c816-74db-4d45-89e4-94bc711b4bd0',
        relationship: 'MOTHER',
        otherRelationship: null,
        individual: null,
        __typename: 'RelatedPerson'
      },
      mother: {
        id: '28dc13ec-efb2-4c15-98a1-d20cbe9689a2',
        name: [
          {
            use: 'en',
            firstNames: 'Edgar',
            familyName: 'Samo',
            __typename: 'HumanName'
          }
        ],
        multipleBirth: null,
        birthDate: '1933-12-12',
        ageOfIndividualInYears: null,
        exactDateOfBirthUnknown: null,
        maritalStatus: null,
        occupation: null,
        detailsExist: true,
        reasonNotApplying: null,
        dateOfMarriage: null,
        educationalAttainment: null,
        nationality: ['FAR'],
        identifier: [
          {
            id: '1296566563',
            type: 'NATIONAL_ID',
            otherType: null,
            __typename: 'IdentityType'
          }
        ],
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '',
              '',
              '',
              '',
              '',
              'URBAN',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              ''
            ],
            district: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
            state: '700f0dda-8d4c-45d8-aa3c-eb17b14874c0',
            city: null,
            postalCode: null,
            country: 'FAR',
            __typename: 'Address'
          }
        ],
        telecom: null,
        __typename: 'Person'
      },
      father: {
        id: 'ea8a0668-bfad-4874-84c2-ad0032ec44c5',
        name: null,
        birthDate: null,
        ageOfIndividualInYears: null,
        exactDateOfBirthUnknown: null,
        maritalStatus: null,
        occupation: null,
        detailsExist: false,
        reasonNotApplying: 'Divorced',
        dateOfMarriage: null,
        educationalAttainment: null,
        nationality: null,
        identifier: null,
        address: null,
        telecom: null,
        __typename: 'Person'
      },
      attendantAtBirth: null,
      weightAtBirth: null,
      birthType: null,
      eventLocation: {
        id: 'abf358df-09c2-40a5-96cb-7e756ac1d748',
        type: 'OTHER',
        address: {
          line: [
            '',
            '',
            '',
            '',
            '',
            'URBAN',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          district: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
          state: '700f0dda-8d4c-45d8-aa3c-eb17b14874c0',
          city: '',
          postalCode: '',
          country: 'FAR',
          __typename: 'Address'
        },
        __typename: 'Location'
      },
      questionnaire: null
    }
  }
}

const actualDeclarationMock = {
  registration: {
    informantType: {
      value: 'MOTHER',
      nestedFields: {
        otherInformantType: null
      }
    },
    contactPoint: {
      value: 'MOTHER',
      nestedFields: {
        registrationPhone: '0751515151'
      }
    },
    _fhirID: '530d9768-20d2-4478-8d89-b43ae55f287f',
    trackingId: 'BPJM787',
    type: 'birth',
    commentsOrNotes: ''
  },
  template: {
    certificateDate: '26 January 2023',
    registrarName: '',
    role: '',
    registrationLocation: ', , ',
    eventDate: '12th December 1955',
    childFirstName: 'Edgar',
    childFamilyName: 'Samo',
    childGender: {
      defaultMessage: 'Male',
      description: 'Option for form field: Sex name',
      id: 'form.field.label.sexMale'
    },
    placeOfBirth: [
      'Ibombo',
      'Central',
      {
        id: 'countries.FAR',
        defaultMessage: 'Farajaland',
        description: 'Fictional country for OpenCRSV demo'
      }
    ],
    placeOfBirthCountry: {
      id: 'countries.FAR',
      defaultMessage: 'Farajaland',
      description: 'Fictional country for OpenCRSV demo'
    },
    placeOfBirthState: 'Central',
    placeOfBirthDistrict: 'Ibombo',
    placeOfBirthCity: '',
    placeOfBirthAddressLine3: '',
    placeOfBirthAddressLine2: '',
    placeOfBirthNumber: '',
    placeOfBirthPostalCode: '',
    placeOfBirthAddressLine5: '',
    placeOfBirthAddressLine1: '',
    motherNationality: '',
    motherNID: '1296566563',
    motherBirthDate: '12th December 1933',
    motherFirstName: 'Sadman',
    motherFamilyName: 'Anik',
    mother: [
      'Ibombo',
      'Central',
      {
        id: 'countries.FAR',
        defaultMessage: 'Farajaland',
        description: 'Fictional country for OpenCRSV demo'
      }
    ],
    motherCountry: {
      id: 'countries.FAR',
      defaultMessage: 'Farajaland',
      description: 'Fictional country for OpenCRSV demo'
    },
    motherCity: '',
    motherAddressLine3: '',
    motherAddressLine2: '',
    motherNumber: '',
    motherPostalCode: '',
    motherAddressLine5: '',
    motherState: 'Central',
    motherDistrict: 'Ibombo',
    motherAddressLine1: '',
    fatherReasonNotApplying: 'Divorced'
  },
  child: {
    childBirthDate: '1955-12-12',
    firstNamesEng: 'Edgar',
    familyNameEng: 'Samo',
    gender: 'male',
    placeOfBirth: 'OTHER',
    birthLocation: '3894eb4f-6ecb-4fd4-addf-ccc6b39ae103',
    country: 'FAR',
    state: '700f0dda-8d4c-45d8-aa3c-eb17b14874c0',
    district: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
    ruralOrUrban: 'URBAN',
    addressLine3UrbanOption: '',
    addressLine2UrbanOption: '',
    numberUrbanOption: '',
    addressLine5: '',
    internationalAddressLine1: '',
    internationalAddressLine2: '',
    internationalAddressLine3: '',
    _fhirID: 'cf040833-5bfb-47d4-ad3e-c3451aa9f5e7'
  },
  informant: {
    _fhirID: '7c481f83-0d3f-47ba-9770-a4bae229ba4a',
    relationship: 'MOTHER'
  },
  mother: {
    detailsExist: true,
    nationality: 'FAR',
    iD: '1296566563',
    motherBirthDate: '1933-12-12',
    exactDateOfBirthUnknown: null,
    firstNamesEng: 'Sadman',
    familyNameEng: 'Anik',
    countryPrimary: 'FAR',
    statePrimary: '700f0dda-8d4c-45d8-aa3c-eb17b14874c0',
    districtPrimary: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
    ruralOrUrbanPrimary: 'URBAN',
    cityUrbanOptionPrimary: null,
    addressLine3UrbanOptionPrimary: '',
    addressLine2UrbanOptionPrimary: '',
    numberUrbanOptionPrimary: '',
    postcodePrimary: null,
    addressLine5Primary: '',
    internationalStatePrimary: '700f0dda-8d4c-45d8-aa3c-eb17b14874c0',
    internationalDistrictPrimary: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
    internationalCityPrimary: null,
    internationalAddressLine1Primary: '',
    internationalAddressLine2Primary: '',
    internationalAddressLine3Primary: '',
    internationalPostcodePrimary: null,
    _fhirID: '69516033-b5d2-4539-8ee2-456ee3be8063'
  },
  father: {
    detailsExist: false,
    reasonNotApplying: 'Divorced',
    exactDateOfBirthUnknown: null,
    primaryAddressSameAsOtherPrimary: false,
    _fhirID: '2433847b-d10e-42f4-96c3-327503d5ebc1'
  },
  documents: {
    uploadDocForChildDOB: [
      {
        data: '/ocrvs/b113f6df-0e8f-4500-82e7-7a296f3943b3.png',
        type: 'image/png',
        optionValues: ['CHILD', 'NOTIFICATION_OF_BIRTH'],
        title: 'CHILD',
        description: 'NOTIFICATION_OF_BIRTH'
      }
    ],
    uploadDocForMother: [
      {
        data: '/ocrvs/2a6928d3-8b76-42ef-8018-2cc4b5a572f6.jpg',
        type: 'image/jpeg',
        optionValues: ['MOTHER', 'NATIONAL_ID'],
        title: 'MOTHER',
        description: 'NATIONAL_ID'
      }
    ],
    uploadDocForFather: [],
    uploadDocForInformant: [],
    uploadDocForProofOfLegalGuardian: []
  },
  _fhirIDMap: {
    composition: '26d3b815-917d-4e72-8efa-835e5ecb86af',
    encounter: '471e2a0a-151f-4e27-9ba0-246d73aae7d0',
    eventLocation: '3894eb4f-6ecb-4fd4-addf-ccc6b39ae103',
    observation: {}
  },
  history: [
    {
      otherReason: '',
      requester: '',
      hasShowedVerifiedDocument: false,
      date: '2023-01-26T06:50:09.044+00:00',
      action: 'ASSIGNED',
      regStatus: 'DECLARED',
      dhis2Notification: false,
      statusReason: null,
      reason: null,
      location: {
        id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
        name: 'Ibombo',
        __typename: 'Location'
      },
      office: {
        id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
        name: 'Ibombo District Office',
        __typename: 'Location'
      },
      system: null,
      user: {
        id: '63b3f284452f2e40afa44094',
        type: '',
        role: 'LOCAL_REGISTRAR',
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
      otherReason: '',
      requester: '',
      hasShowedVerifiedDocument: false,
      date: '2023-01-26T06:49:31.353+00:00',
      action: null,
      regStatus: 'DECLARED',
      dhis2Notification: false,
      statusReason: null,
      reason: null,
      location: {
        id: '66d9dea3-c2f1-47db-bb32-4cb6052d5086',
        name: 'Ibombo',
        __typename: 'Location'
      },
      office: {
        id: 'f71cfdad-2081-4edf-b046-d9f55d8335ed',
        name: 'Ibombo District Office',
        __typename: 'Location'
      },
      system: null,
      user: {
        id: '63b3f284452f2e40afa44092',
        type: 'SOCIAL_WORKER',
        role: 'FIELD_AGENT',
        name: [
          {
            firstNames: 'Kalusha',
            familyName: 'Bwalya',
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
  ]
}

describe('when user is in the register form review section', () => {
  const mockViewRecordFunction = vi.fn()
  mockViewRecordFunction.mockReturnValue(viewRecordMock)
  ViewRecordQueries.fetchDeclarationForViewing = mockViewRecordFunction
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store, history } = await createTestStore()
    const declaration = createReviewDeclaration(
      uuid(),
      {
        ...actualDeclarationMock,
        // @ts-ignore
        duplicates: [
          {
            compositionId: '4090df15-f4e5-4f16-ae7e-bb518129d493',
            trackingId: 'DHN9T01',
            __typename: 'DuplicatesInfo'
          }
        ]
      },
      Event.Birth
    )
    declaration.duplicates = [
      {
        compositionId: '4090df15-f4e5-4f16-ae7e-bb518129d493',
        trackingId: 'DHN9T01'
      }
    ]
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(declaration))
    const mock: any = vi.fn()
    vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])

    const form = await getReviewFormFromStore(store, Event.Birth)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        declaration={declaration}
        duplicate={true}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            groupId: 'review-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
    )
    component = testComponent
  })

  it('should show the duplicate tracking id in tab', async () => {
    expect(
      component
        .find('#tab_4090df15-f4e5-4f16-ae7e-bb518129d493')
        .hostNodes()
        .text()
    ).toBe('DHN9T01')
  })

  it('should show comparison when click on duplicate trackingId from tab', async () => {
    component
      .find('#tab_4090df15-f4e5-4f16-ae7e-bb518129d493')
      .hostNodes()
      .simulate('click')
    component.update()

    expect(component.find('#content-name').hostNodes().text()).toBe(
      'Is Edgar Samo (BPJM787) a duplicate?'
    )
  })
})
