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
        type: 'REJECTED',
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
