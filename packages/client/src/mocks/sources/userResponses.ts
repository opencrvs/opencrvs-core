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
import { SystemRoleType, Status, FetchUserQuery } from '@client/utils/gateway'

export const registrarResponse: FetchUserQuery = {
  getUser: {
    id: '6501acbe81245ece9e627bfe',
    userMgntUserID: '6501acbe81245ece9e627bfe',
    creationDate: '1694608574680',
    username: 'k.mweene',
    practitionerId: '48455871-1636-46a1-8279-aaa76dec03d4',
    mobile: '0933333333',
    email: 'kalushabwalya1.7@gmail.com',
    systemRole: SystemRoleType.LocalRegistrar,
    role: {
      _id: '6501acb281245ece9e627ba4',
      labels: [
        {
          lang: 'en',
          label: 'Local Registrar',
          __typename: 'RoleLabel'
        },
        {
          lang: 'fr',
          label: 'Registraire local',
          __typename: 'RoleLabel'
        }
      ],
      __typename: 'Role'
    },
    status: Status.Active,
    name: [
      {
        use: 'en',
        firstNames: 'Kennedy',
        familyName: 'Mweene',
        __typename: 'HumanName'
      }
    ],
    primaryOffice: {
      id: '6293dd20-7040-43c1-b2e3-d9764316f265',
      name: 'Ibombo District Office',
      alias: ['Ibombo District Office'],
      status: 'active',
      __typename: 'Location'
    },
    localRegistrar: {
      name: [
        {
          use: 'en',
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          __typename: 'HumanName'
        }
      ],
      role: SystemRoleType.LocalRegistrar,
      signature: {
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg==',
        type: 'image/png',
        __typename: 'Signature'
      },
      __typename: 'LocalRegistrar'
    },
    avatar: null,
    searches: [],
    __typename: 'User'
  }
}

export const fieldAgentResponse: FetchUserQuery = {
  getUser: {
    id: '67067bbd3f0a7fc5fac222b2',
    userMgntUserID: '67067bbd3f0a7fc5fac222b2',
    creationDate: '1728478141789',
    username: 'k.bwalya',
    practitionerId: '0b122b61-9c7a-46f2-b006-5e40e9b7726d',
    mobile: '+260911111111',
    email: 'kalushabwalya17@gmail.com',
    systemRole: SystemRoleType.FieldAgent,
    role: {
      _id: '67067bbc3f0a7fc5fac2228d',
      labels: [
        {
          lang: 'en',
          label: 'Social Worker',
          __typename: 'RoleLabel'
        },
        {
          lang: 'fr',
          label: 'Travailleur social',
          __typename: 'RoleLabel'
        }
      ],
      __typename: 'Role'
    },
    status: Status.Active,
    name: [
      {
        use: 'en',
        firstNames: 'Kalusha',
        familyName: 'Bwalya',
        __typename: 'HumanName'
      }
    ],
    primaryOffice: {
      id: '45092047-afb5-48b2-8eab-72e3a4979392',
      name: 'Ibombo District Office',
      alias: ['Ibombo District Office'],
      status: 'active',
      __typename: 'Location'
    },
    localRegistrar: {
      name: [
        {
          use: 'en',
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          __typename: 'HumanName'
        }
      ],
      role: SystemRoleType.LocalRegistrar,
      signature: null,
      __typename: 'LocalRegistrar'
    },
    avatar: null,
    searches: [],
    __typename: 'User'
  }
}

export const registrationAgentResponse: FetchUserQuery = {
  getUser: {
    id: '67067bbe3f0a7fc5fac222bb',
    userMgntUserID: '67067bbe3f0a7fc5fac222bb',
    creationDate: '1728478142017',
    username: 'f.katongo',
    practitionerId: '40de746f-3655-43e4-a8c9-146834a6821c',
    mobile: '+260922222222',
    email: 'kalushabwalya17+@gmail.com',
    systemRole: SystemRoleType.RegistrationAgent,
    role: {
      _id: '67067bbc3f0a7fc5fac22295',
      labels: [
        {
          lang: 'en',
          label: 'Registration Agent',
          __typename: 'RoleLabel'
        },
        {
          lang: 'fr',
          label: "Agent d'enregistrement",
          __typename: 'RoleLabel'
        }
      ],
      __typename: 'Role'
    },
    status: Status.Active,
    name: [
      {
        use: 'en',
        firstNames: 'Felix',
        familyName: 'Katongo',
        __typename: 'HumanName'
      }
    ],
    primaryOffice: {
      id: '45092047-afb5-48b2-8eab-72e3a4979392',
      name: 'Ibombo District Office',
      alias: ['Ibombo District Office'],
      status: 'active',
      __typename: 'Location'
    },
    localRegistrar: {
      name: [
        {
          use: 'en',
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          __typename: 'HumanName'
        }
      ],
      role: SystemRoleType.LocalRegistrar,
      signature: null,
      __typename: 'LocalRegistrar'
    },
    avatar: null,
    searches: [],
    __typename: 'User'
  }
}
