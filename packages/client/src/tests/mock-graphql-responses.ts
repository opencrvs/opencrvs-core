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

import { GET_BIRTH_REGISTRATION_FOR_CERTIFICATE } from '@client/views/DataProvider/birth/queries'
import { GET_DEATH_REGISTRATION_FOR_CERTIFICATION } from '@client/views/DataProvider/death/queries'

// late birth registration without father details
export const lateBirthCertificationResponse = [
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
          father: null,
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
                type: 'CHAIRMAN',
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
                type: 'CHAIRMAN',
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
                type: 'CHAIRMAN',
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
                type: 'CHAIRMAN',
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
                type: 'CHAIRMAN',
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
                type: 'CHAIRMAN',
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
// free birth registration without father details
export const onTimeBirthCertificationResponse = [
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
            birthDate: '2022-04-01',
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
          father: null,
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
                type: 'CHAIRMAN',
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
                type: 'CHAIRMAN',
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
                type: 'CHAIRMAN',
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

export const deathCertificationResponse = [
  {
    request: {
      query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
      variables: { id: '16ff35e1-3f92-4db3-b812-c402e609fb00' }
    },
    result: {
      data: {
        fetchDeathRegistration: {
          _fhirIDMap: { composition: '67fe94da-4fde-49b9-a531-8f4ac6f37eb3' },
          id: '67fe94da-4fde-49b9-a531-8f4ac6f37eb3',
          deceased: {
            id: 'f82aabc0-9822-465b-a3eb-590ebf5fc27f',
            name: [
              {
                use: 'en',
                firstNames: 'Harry',
                familyName: 'Kane',
                __typename: 'HumanName'
              }
            ],
            birthDate: '1990-02-02',
            age: null,
            gender: 'male',
            maritalStatus: 'MARRIED',
            nationality: ['FAR'],
            identifier: [
              {
                id: '654654653',
                type: 'NATIONAL_ID',
                otherType: null,
                __typename: 'IdentityType'
              },
              {
                id: 'dstgsgs',
                type: 'SOCIAL_SECURITY_NO',
                otherType: null,
                __typename: 'IdentityType'
              },
              {
                id: '2022D16EO09',
                type: 'DEATH_REGISTRATION_NUMBER',
                otherType: null,
                __typename: 'IdentityType'
              }
            ],
            deceased: { deathDate: '2022-04-10', __typename: 'Deceased' },
            address: [
              {
                type: 'PERMANENT',
                line: [
                  '19',
                  'My street',
                  'My residential area',
                  'My town',
                  '',
                  '',
                  'URBAN'
                ],
                district: '871f290e-8c7c-4643-b79b-2465af5f3303',
                state: '169981c1-89af-44f9-906a-bf783028ed14',
                city: null,
                postalCode: null,
                country: 'FAR',
                __typename: 'Address'
              }
            ],
            __typename: 'Person'
          },
          informant: {
            id: 'b69eef3b-1a7a-4873-b977-98c831928ce9',
            relationship: 'SPOUSE',
            otherRelationship: null,
            individual: {
              id: 'dcb2c517-6173-4aa0-a821-c59b69f826a7',
              identifier: [
                {
                  id: '654654654',
                  type: 'NATIONAL_ID',
                  otherType: null,
                  __typename: 'IdentityType'
                }
              ],
              name: [
                {
                  use: 'en',
                  firstNames: 'Sally',
                  familyName: 'Kane',
                  __typename: 'HumanName'
                }
              ],
              nationality: ['FAR'],
              occupation: null,
              reasonNotApplying: null,
              birthDate: null,
              telecom: null,
              address: [
                {
                  type: 'PERMANENT',
                  line: [
                    '12',
                    'My street',
                    'My area',
                    'My Town',
                    '',
                    '',
                    'URBAN'
                  ],
                  district: '901a5fc1-456e-4f9c-9d3e-1859ad321837',
                  state: 'ef97aebc-2461-473f-bf6e-456ed1e1a217',
                  city: null,
                  postalCode: null,
                  country: 'FAR',
                  __typename: 'Address'
                }
              ],
              __typename: 'Person'
            },
            __typename: 'RelatedPerson'
          },
          father: {
            id: 'e2e4e267-8ce5-41c1-8da0-12808f65a7e9',
            name: [
              {
                use: 'en',
                firstNames: 'Bill',
                familyName: 'Kane',
                __typename: 'HumanName'
              }
            ],
            __typename: 'Person'
          },
          mother: {
            id: '4640efe8-6eda-45b1-95b6-448dda21bf83',
            name: [
              {
                use: 'en',
                firstNames: 'Francis',
                familyName: 'Kane',
                __typename: 'HumanName'
              }
            ],
            __typename: 'Person'
          },
          spouse: null,
          medicalPractitioner: null,
          registration: {
            id: 'e0177439-baff-4d09-aad9-ca307c2dd7f7',
            contact: 'SPOUSE',
            informantType: 'SPOUSE',
            otherInformantType: null,
            contactRelationship: null,
            contactPhoneNumber: '+260787877877',
            attachments: null,
            status: [
              {
                type: 'REGISTERED',
                timestamp: '2022-04-14T12:49:55.152Z',
                __typename: 'RegWorkflow'
              },
              {
                type: 'REGISTERED',
                timestamp: '2022-04-14T12:49:55.152Z',
                __typename: 'RegWorkflow'
              },
              {
                type: 'WAITING_VALIDATION',
                timestamp: '2022-04-14T12:49:55.152Z',
                __typename: 'RegWorkflow'
              },
              {
                type: 'DECLARATION_UPDATED',
                timestamp: '2022-04-14T12:49:55.152Z',
                __typename: 'RegWorkflow'
              },
              {
                type: 'DECLARED',
                timestamp: '2022-04-14T10:42:03.712Z',
                __typename: 'RegWorkflow'
              },
              {
                type: 'DECLARED',
                timestamp: '2022-04-14T10:42:03.712Z',
                __typename: 'RegWorkflow'
              }
            ],
            type: 'DEATH',
            trackingId: 'D16EO09',
            registrationNumber: '2022D16EO09',
            __typename: 'Registration'
          },
          eventLocation: {
            id: '76fa398b-c182-4b07-8a9a-524b9382106e',
            type: 'PERMANENT',
            address: {
              type: 'PERMANENT',
              line: [
                '19',
                'My street',
                'My residential area',
                'My town',
                '',
                '',
                'URBAN'
              ],
              district: '871f290e-8c7c-4643-b79b-2465af5f3303',
              state: '169981c1-89af-44f9-906a-bf783028ed14',
              city: null,
              postalCode: null,
              country: 'FAR',
              __typename: 'Address'
            },
            __typename: 'Location'
          },
          questionnaire: null,
          mannerOfDeath: 'NATURAL_CAUSES',
          causeOfDeath: 'Natural causes',
          maleDependentsOfDeceased: null,
          femaleDependentsOfDeceased: null,
          history: [
            {
              date: '2022-04-14T12:50:17.309+00:00',
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
                type: 'CHAIRMAN',
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
              comments: [],
              input: [],
              output: [],
              certificates: null,
              __typename: 'History'
            },
            {
              date: '2022-04-14T12:49:56.162+00:00',
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
                type: 'CHAIRMAN',
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
              comments: [],
              input: [],
              output: [],
              certificates: null,
              __typename: 'History'
            },
            {
              date: '2022-04-14T12:49:55.977+00:00',
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
                type: 'CHAIRMAN',
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
              comments: [],
              input: [],
              output: [],
              certificates: null,
              __typename: 'History'
            },
            {
              date: '2022-04-14T12:49:55.721+00:00',
              action: 'DECLARATION_UPDATED',
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
                type: 'CHAIRMAN',
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
              comments: [],
              input: [
                {
                  valueCode: 'deceased',
                  valueId: 'iD',
                  valueString: '987987987',
                  __typename: 'InputOutput'
                }
              ],
              output: [
                {
                  valueCode: 'deceased',
                  valueId: 'iD',
                  valueString: '654654653',
                  __typename: 'InputOutput'
                }
              ],
              certificates: null,
              __typename: 'History'
            },
            {
              date: '2022-04-14T10:42:31.887+00:00',
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
                type: 'CHAIRMAN',
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
              comments: [],
              input: [],
              output: [],
              certificates: null,
              __typename: 'History'
            },
            {
              date: '2022-04-14T10:42:04.494+00:00',
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
                type: 'CHA',
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
              comments: [],
              input: [],
              output: [],
              certificates: null,
              __typename: 'History'
            }
          ],
          __typename: 'DeathRegistration'
        }
      }
    }
  }
]
