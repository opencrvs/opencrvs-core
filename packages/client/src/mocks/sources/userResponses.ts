import { SystemRoleType, Status, FetchUserQuery } from '@client/utils/gateway'

export const registrar: FetchUserQuery = {
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
    catchmentArea: [
      {
        id: '6293dd20-7040-43c1-b2e3-d9764316f265',
        name: 'Ibombo District Office',
        alias: ['Ibombo District Office'],
        status: 'active',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_JWMRGwDBXK',
            __typename: 'Identifier'
          }
        ],
        __typename: 'Location'
      },
      {
        id: 'fb8e19a3-a191-404c-a6ad-58e7963c1d57',
        name: 'Ibombo',
        alias: ['Ibombo'],
        status: 'active',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_oEBf29y8JP8',
            __typename: 'Identifier'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT',
            __typename: 'Identifier'
          }
        ],
        __typename: 'Location'
      },
      {
        id: '019f9e08-4180-4ce6-a842-47bbc0c40037',
        name: 'Central',
        alias: ['Central'],
        status: 'active',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_AWn3s2RqgAN',
            __typename: 'Identifier'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE',
            __typename: 'Identifier'
          }
        ],
        __typename: 'Location'
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
