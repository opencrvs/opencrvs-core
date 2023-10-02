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
  GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
  GET_BIRTH_REGISTRATION_FOR_REVIEW
} from '@client/views/DataProvider/birth/queries'
import {
  GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
  GET_DEATH_REGISTRATION_FOR_REVIEW
} from '@client/views/DataProvider/death/queries'
import { createReviewDeclaration } from '@opencrvs/client/src/declarations'
import { Event } from '@client/utils/gateway'
import { v4 as uuid } from 'uuid'

export const birthDeclarationForReview = {
  _fhirIDMap: {
    composition: 'ab6123f6-0fce-43f2-a973-c538d04de741',
    encounter: 'd899acf9-bee2-46fc-afac-1296d04bb4d6',
    eventLocation: '98bd3c74-a684-47bb-be30-68fda5cfd7ca',
    observation: {
      birthType: 'ca45479d-365b-4883-9980-e3687f5eafb3',
      weightAtBirth: '22c18ced-5fad-4ec4-8dad-29bd05b20fd9',
      attendantAtBirth: '302f91de-eeaa-4ef9-a22c-7a488aad19a5'
    }
  },
  id: 'ab6123f6-0fce-43f2-a973-c538d04de741',
  child: {
    id: 'ba9ae6be-3b1a-4234-a813-600d43407334',
    multipleBirth: null,
    name: [
      {
        use: 'en',
        firstNames: 'Harry',
        familyName: 'Styles',
        __typename: 'HumanName'
      }
    ],
    birthDate: '2022-02-02',
    gender: 'male',
    __typename: 'Person'
  },
  informant: {
    id: '0fc8d8e2-5736-4809-8de8-796001c4f983',
    relationship: 'MOTHER',
    otherRelationship: null,
    individual: null,
    __typename: 'RelatedPerson'
  },
  mother: {
    id: '0928591a-82d7-4f30-8d55-46d3744ec4f9',
    name: [
      {
        use: 'en',
        firstNames: 'Sally',
        familyName: 'Styles',
        __typename: 'HumanName'
      }
    ],
    birthDate: '1990-09-19',
    maritalStatus: 'MARRIED',
    occupation: 'Teacher',
    detailsExist: true,
    reasonNotApplying: null,
    dateOfMarriage: null,
    educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
    nationality: ['FAR'],
    identifier: [
      {
        id: '321654987',
        type: 'NATIONAL_ID',
        otherType: null,
        __typename: 'IdentityType'
      }
    ],
    address: [
      {
        type: 'PRIMARY_ADDRESS',
        line: ['', '', '', '', 'Mother village', 'RURAL'],
        district: '852b103f-2fe0-4871-a323-51e51c6d9198',
        state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
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
    id: '51ac52fe-754f-4c91-8e71-c4e5c7252cc1',
    name: [
      {
        use: 'en',
        firstNames: 'Frank',
        familyName: 'Styles',
        __typename: 'HumanName'
      }
    ],
    birthDate: '1990-12-23',
    maritalStatus: 'MARRIED',
    occupation: 'Teacher',
    detailsExist: true,
    reasonNotApplying: null,
    dateOfMarriage: null,
    educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
    nationality: ['FAR'],
    identifier: [
      {
        id: '321654985',
        type: 'NATIONAL_ID',
        otherType: null,
        __typename: 'IdentityType'
      }
    ],
    address: [
      {
        type: 'PRIMARY_ADDRESS',
        line: ['', '', '', '', 'Mother village', 'RURAL'],
        district: '852b103f-2fe0-4871-a323-51e51c6d9198',
        state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
        city: null,
        postalCode: null,
        country: 'FAR',
        __typename: 'Address'
      }
    ],
    telecom: null,
    __typename: 'Person'
  },
  registration: {
    id: 'a7b81b67-abce-4c60-9e41-469a0b9c85b3',
    informantType: 'MOTHER',
    otherInformantType: null,
    contact: 'MOTHER',
    contactRelationship: null,
    contactPhoneNumber: '+260787878787',
    attachments: [
      {
        contentType: 'image/jpeg',
        subject: 'MOTHER',
        type: 'BIRTH_CERTIFICATE',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
      }
    ],
    status: [
      {
        comments: null,
        type: 'DECLARED',
        timestamp: '2022-04-28T15:19:12.858Z',
        __typename: 'RegWorkflow'
      },
      {
        comments: null,
        type: 'DECLARED',
        timestamp: '2022-04-28T15:19:12.858Z',
        __typename: 'RegWorkflow'
      }
    ],
    type: 'BIRTH',
    trackingId: 'B8OKPC3',
    registrationNumber: null,
    __typename: 'Registration'
  },
  attendantAtBirth: 'PHYSICIAN',
  weightAtBirth: 5,
  birthType: 'SINGLE',
  eventLocation: {
    id: '98bd3c74-a684-47bb-be30-68fda5cfd7ca',
    type: 'PRIVATE_HOME',
    address: {
      line: [
        'Flat 10',
        'Birth street',
        'Birth residential area',
        '',
        '',
        'URBAN'
      ],
      district: '852b103f-2fe0-4871-a323-51e51c6d9198',
      state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
      city: 'Birth Town',
      postalCode: 'SW1',
      country: 'FAR',
      __typename: 'Address'
    },
    __typename: 'Location'
  },
  questionnaire: null,
  history: [
    {
      date: '2022-04-28T15:23:23.151+00:00',
      action: 'DOWNLOADED',
      reinstated: false,
      statusReason: null,
      location: {
        id: '852b103f-2fe0-4871-a323-51e51c6d9198',
        name: 'Ibombo',
        __typename: 'Location'
      },
      office: {
        id: '204f706f-e097-4394-9d12-bd50f057f923',
        name: 'Ibombo District Office',
        __typename: 'Location'
      },
      user: {
        id: '6241918dd6dc544f60d8f73a',
        role: 'CHAIRMAN',
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
      comments: [],
      input: [],
      output: [],
      certificates: null,
      __typename: 'History'
    },
    {
      date: '2022-04-28T15:19:13.678+00:00',
      action: 'DECLARED',
      reinstated: false,
      statusReason: null,
      location: {
        id: '852b103f-2fe0-4871-a323-51e51c6d9198',
        name: 'Ibombo',
        __typename: 'Location'
      },
      office: {
        id: '204f706f-e097-4394-9d12-bd50f057f923',
        name: 'Ibombo District Office',
        __typename: 'Location'
      },
      user: {
        id: '6241918dd6dc544f60d8f738',
        role: 'CHA',
        systemRole: 'FIELD_AGENT',
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
      comments: [],
      input: [],
      output: [],
      certificates: null,
      __typename: 'History'
    }
  ],
  __typename: 'BirthRegistration'
}

// late birth registration with father details
export const lateBirthCertificationResponseWithFather = [
  {
    request: {
      query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
      variables: { id: '6a5fd35d-01ec-4c37-976e-e055107a74a1' }
    },
    result: {
      data: {
        fetchBirthRegistration: {
          _fhirIDMap: {
            composition: '4a2fcc2a-d5f5-46e2-9d55-0a6fb0dca5b1',
            encounter: '733fe804-cff3-40dc-a7c9-5e5c5ecf1ad7',
            eventLocation: 'ecc82ed2-960d-4a92-9c42-67cace118a02',
            observation: {
              birthType: '960244b5-6ec2-4ee5-8ba2-ce282df1c086',
              weightAtBirth: '31121f4b-dd91-46c1-9395-5e39e6b2c7cc',
              attendantAtBirth: '40b1fa41-3ced-4288-b303-f7badc2d8c3b'
            }
          },
          id: '4a2fcc2a-d5f5-46e2-9d55-0a6fb0dca5b1',
          child: {
            id: 'cfa8b077-b0cf-4dce-9e04-78dc7aa37380',
            multipleBirth: 1,
            name: [
              {
                use: 'en',
                firstNames: 'Son',
                familyName: 'Heung Min',
                __typename: 'HumanName'
              }
            ],
            birthDate: '2021-12-23',
            gender: 'male',
            __typename: 'Person'
          },
          informant: {
            id: '7ac5c5de-ecfb-40e4-bf02-53c7f726ca18',
            relationship: 'MOTHER',
            otherRelationship: null,
            individual: null,
            __typename: 'RelatedPerson'
          },
          mother: {
            id: 'e62684c0-be5c-45d7-a89f-c0f01f165aa1',
            name: [
              {
                use: 'en',
                firstNames: 'Sally',
                familyName: 'Heung Min',
                __typename: 'HumanName'
              }
            ],
            birthDate: '1990-02-02',
            maritalStatus: 'MARRIED',
            occupation: null,
            detailsExist: true,
            reasonNotApplying: null,
            dateOfMarriage: null,
            educationalAttainment: 'POST_SECONDARY_ISCED_4',
            nationality: ['FAR'],
            identifier: [
              {
                id: '321654987',
                type: 'NATIONAL_ID',
                otherType: null,
                __typename: 'IdentityType'
              }
            ],
            address: [
              {
                type: 'PLACE_OF_HERITAGE',
                line: ['', '', '', '', '', ''],
                district: '15be3bed-10e9-4a09-b195-cbb54a47eccb',
                state: 'f050a94e-4e61-4cfb-a9ac-b3e96096e267',
                city: null,
                postalCode: null,
                country: 'FAR',
                __typename: 'Address'
              },
              {
                type: 'PERMANENT',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '039a4bcd-2c24-4210-a833-5bfe38ae07d6',
                state: '169981c1-89af-44f9-906a-bf783028ed14',
                city: null,
                postalCode: null,
                country: 'FAR',
                __typename: 'Address'
              },
              {
                type: 'CURRENT',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '039a4bcd-2c24-4210-a833-5bfe38ae07d6',
                state: '169981c1-89af-44f9-906a-bf783028ed14',
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
            id: 'e62684c0-be5c-45d7-a89f-c0f01f165aa1',
            name: [
              {
                use: 'en',
                firstNames: 'Frank',
                familyName: 'Heung Min',
                __typename: 'HumanName'
              }
            ],
            birthDate: '1990-02-02',
            maritalStatus: 'MARRIED',
            occupation: null,
            detailsExist: true,
            reasonNotApplying: null,
            dateOfMarriage: null,
            educationalAttainment: 'POST_SECONDARY_ISCED_4',
            nationality: ['FAR'],
            identifier: [
              {
                id: '321654987',
                type: 'NATIONAL_ID',
                otherType: null,
                __typename: 'IdentityType'
              }
            ],
            address: [
              {
                type: 'PLACE_OF_HERITAGE',
                line: ['', '', '', '', '', ''],
                district: '15be3bed-10e9-4a09-b195-cbb54a47eccb',
                state: 'f050a94e-4e61-4cfb-a9ac-b3e96096e267',
                city: null,
                postalCode: null,
                country: 'FAR',
                __typename: 'Address'
              },
              {
                type: 'PERMANENT',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '039a4bcd-2c24-4210-a833-5bfe38ae07d6',
                state: '169981c1-89af-44f9-906a-bf783028ed14',
                city: null,
                postalCode: null,
                country: 'FAR',
                __typename: 'Address'
              },
              {
                type: 'CURRENT',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '039a4bcd-2c24-4210-a833-5bfe38ae07d6',
                state: '169981c1-89af-44f9-906a-bf783028ed14',
                city: null,
                postalCode: null,
                country: 'FAR',
                __typename: 'Address'
              }
            ],
            telecom: null,
            __typename: 'Person'
          },
          registration: {
            id: '850a6503-5f86-4412-8496-b91eb1cdd34f',
            informantType: 'MOTHER',
            otherInformantType: null,
            contact: 'FATHER',
            contactRelationship: null,
            contactPhoneNumber: '+260787877877',
            attachments: null,
            status: [
              {
                comments: null,
                type: 'REGISTERED',
                timestamp: '2022-04-14T12:52:25.151Z',
                __typename: 'RegWorkflow'
              },
              {
                comments: null,
                type: 'REGISTERED',
                timestamp: '2022-04-14T12:52:25.151Z',
                __typename: 'RegWorkflow'
              },
              {
                comments: null,
                type: 'WAITING_VALIDATION',
                timestamp: '2022-04-14T12:52:25.151Z',
                __typename: 'RegWorkflow'
              }
            ],
            type: 'BIRTH',
            trackingId: 'BHEOYEI',
            registrationNumber: '2022BHEOYEI',
            __typename: 'Registration'
          },
          attendantAtBirth: 'PHYSICIAN',
          weightAtBirth: 4,
          birthType: 'SINGLE',
          eventLocation: {
            type: 'HEALTH_FACILITY',
            address: {
              line: [],
              district: null,
              state: null,
              city: null,
              postalCode: null,
              country: null,
              __typename: 'Address'
            },
            __typename: 'Location'
          },
          questionnaire: null,
          history: [
            {
              date: '2022-04-14T12:52:34.112+00:00',
              action: 'DOWNLOADED',
              reinstated: false,
              statusReason: null,
              location: {
                id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                name: 'Ibombo',
                __typename: 'Location'
              },
              office: {
                id: '204f706f-e097-4394-9d12-bd50f057f923',
                name: 'Ibombo District Office',
                __typename: 'Location'
              },
              user: {
                id: '6241918dd6dc544f60d8f73a',
                role: 'CHAIRMAN',
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
              date: '2022-04-14T12:52:25.951+00:00',
              action: 'REGISTERED',
              reinstated: false,
              statusReason: null,
              location: {
                id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                name: 'Ibombo',
                __typename: 'Location'
              },
              office: {
                id: '204f706f-e097-4394-9d12-bd50f057f923',
                name: 'Ibombo District Office',
                __typename: 'Location'
              },
              user: {
                id: '6241918dd6dc544f60d8f73a',
                role: 'CHAIRMAN',
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
                data: 'data:image/png;base64,iVBORw0KGgoAAA',
                type: 'image/png'
              },
              comments: [],
              input: [],
              output: [],
              certificates: null,
              __typename: 'History'
            },
            {
              date: '2022-04-14T12:52:25.798+00:00',
              action: 'WAITING_VALIDATION',
              reinstated: false,
              statusReason: null,
              location: {
                id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                name: 'Ibombo',
                __typename: 'Location'
              },
              office: {
                id: '204f706f-e097-4394-9d12-bd50f057f923',
                name: 'Ibombo District Office',
                __typename: 'Location'
              },
              user: {
                id: '6241918dd6dc544f60d8f73a',
                role: 'CHAIRMAN',
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
            }
          ],
          __typename: 'BirthRegistration'
        }
      }
    }
  }
]

export const informantSMSNotificationMock = [
  {
    id: '63a30240ee4b270dc91f53d0',
    name: 'birthInProgressSMS',
    enabled: true,
    updatedAt: '1671688043153',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  },
  {
    id: '63a30240ee4b270dc91f53d1',
    name: 'birthDeclarationSMS',
    enabled: false,
    updatedAt: '1671688046478',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  },
  {
    id: '63a30240ee4b270dc91f53d2',
    name: 'birthRegistrationSMS',
    enabled: true,
    updatedAt: '1671627328205',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  },
  {
    id: '63a30240ee4b270dc91f53d3',
    name: 'birthRejectionSMS',
    enabled: true,
    updatedAt: '1671627328205',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  },
  {
    id: '63a30240ee4b270dc91f53d4',
    name: 'deathInProgressSMS',
    enabled: true,
    updatedAt: '1671627328205',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  },
  {
    id: '63a30240ee4b270dc91f53d5',
    name: 'deathDeclarationSMS',
    enabled: true,
    updatedAt: '1671627328205',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  },
  {
    id: '63a30240ee4b270dc91f53d6',
    name: 'deathRegistrationSMS',
    enabled: true,
    updatedAt: '1671627328205',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  },
  {
    id: '63a30240ee4b270dc91f53d7',
    name: 'deathRejectionSMS',
    enabled: true,
    updatedAt: '1671627328205',
    createdAt: '1671627328205',
    __typename: 'SMSNotification'
  }
]
