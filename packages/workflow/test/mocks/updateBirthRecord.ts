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

import { BirthRegistration } from '@opencrvs/commons/types'

export const updateBirthRegistrationPayload: BirthRegistration = {
  createdAt: '2023-11-30T12:36:27.043Z',
  registration: {
    status: [
      {
        timestamp: '2023-11-30T12:36:27.044Z',
        timeLoggedMS: 210764
      }
    ],
    informantType: 'MOTHER',
    contactEmail: 'abc@xyz.com',
    draftId: '7c3af302-08c9-41af-8701-92de9a71a3e4',
    changedValues: [
      {
        section: 'mother',
        fieldName: 'firstNamesEng',
        newValue: 'Ghosheti',
        oldValue: 'Sufiana'
      },
      {
        section: 'mother',
        fieldName: 'familyNameEng',
        newValue: 'Begum',
        oldValue: 'Khatum'
      },
      {
        section: 'mother',
        fieldName: 'fatherBirthDate',
        newValue: '2000-12-14',
        oldValue: '2000-12-12'
      }
    ]
  },
  child: {
    name: [
      {
        use: 'en',
        firstNames: 'Salam',
        familyName: 'Ahmed'
      }
    ],
    gender: 'male',
    birthDate: '2022-11-10',
    identifier: []
  },
  eventLocation: {
    _fhirID: '146251e9-df90-4068-82b0-27d8f979e8e2'
  },
  mother: {
    name: [
      {
        use: 'en',
        firstNames: 'Sufiana',
        familyName: 'Khatum'
      }
    ],
    birthDate: '1993-08-09',
    nationality: ['FAR'],
    identifier: [
      {
        id: '1234123421',
        type: 'NATIONAL_ID'
      }
    ],
    address: [
      {
        type: 'PRIMARY_ADDRESS',
        line: ['', '', '', '', '', 'URBAN', '', '', '', '', '', '', '', '', ''],
        country: 'FAR',
        state: 'ed6195ff-0f83-4852-832e-dc9db07151ff',
        partOf: '0f7684aa-8c65-4901-8318-bf1e22c247cb',
        district: '0f7684aa-8c65-4901-8318-bf1e22c247cb'
      }
    ]
  },
  father: {
    detailsExist: false,
    reasonNotApplying: 'No idea'
  }
}
