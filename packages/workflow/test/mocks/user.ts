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
export const user = {
  _id: '6566e210ef389bf1b1915057',
  name: [
    {
      use: 'en',
      given: ['Kalusha'],
      family: 'Bwalya'
    }
  ],
  username: 'k.bwalya',
  identifiers: [],
  email: '',
  emailForNotification: 'kalushabwalya17@gmail.com',
  mobile: '0911111111',
  passwordHash: '$2a$10$81x6lhKSpZvm0QV.IAd/bO3xZiaZ8y/Kd9iObP9bhsOcWQVTAJaO2',
  salt: '$2a$10$81x6lhKSpZvm0QV.IAd/bO',
  systemRole: 'FIELD_AGENT',
  role: {
    _id: '6566e20def389bf1b1915000',
    __v: 0,
    createdAt: '2023-11-29T07:02:37.399Z',
    labels: [
      {
        lang: 'en',
        label: 'Social Worker'
      },
      {
        lang: 'fr',
        label: 'Travailleur social'
      }
    ],
    updatedAt: '2023-11-29T07:02:37.399Z'
  },
  practitionerId: '4651d1cc-6072-4e34-bf20-b583f421a9f1',
  primaryOfficeId: 'ce73938d-a188-4a78-9d19-35dfd4ca6957',
  scope: ['declare', 'demo'],
  status: 'active',
  securityQuestionAnswers: [],
  creationDate: 1701241360173,
  auditHistory: [],
  searches: [],
  __v: 0
}

export const registrar = {
  _id: '66619331a6a4a835aa689dfd',
  name: [
    {
      use: 'en',
      given: ['Kennedy'],
      family: 'Mweene'
    }
  ],
  username: 'k.mweene',
  identifiers: [],
  email: '',
  emailForNotification: 'kalushabwalya1.7@gmail.com',
  mobile: '0933333333',
  passwordHash: '$2a$10$Ss1IOh7BmD6wje96VMppheEpHywYjfQgvAy6BRB.ISwM79TvjfnN6',
  salt: '$2a$10$Ss1IOh7BmD6wje96VMpphe',
  systemRole: 'LOCAL_REGISTRAR',
  role: '66619330a6a4a835aa689ddb',
  practitionerId: '648c914d-de38-4c24-bdc9-ce8ee8cacd4c',
  primaryOfficeId: '435e5301-063d-4f22-958e-24176cfb4e54',
  scope: [
    'record.register',
    'performance.read',
    'record.print-issue-certified-copies',
    'demo'
  ],
  status: 'active',
  securityQuestionAnswers: [],
  creationDate: 1717670705858,
  auditHistory: [],
  searches: [],
  __v: 0
}
