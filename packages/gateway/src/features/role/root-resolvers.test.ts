import { resolvers } from '@gateway/features/role/root-resolvers'
import * as fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

describe('Role root resolvers', () => {
  describe('getRoles()', () => {
    const dummyRoleList = [
      {
        title: 'Field Agent',
        value: 'FIELD_AGENT',
        types: ['Hospital', 'CHA'],
        active: true,
        creationDate: 1559054406433
      },
      {
        title: 'Registration Agent',
        value: 'REGISTRATION_CLERK',
        types: ['Entrepeneur', 'Data entry clerk'],
        active: true,
        creationDate: 1559054406444
      },
      {
        title: 'Registrar',
        value: 'LOCAL_REGISTRAR',
        types: ['Secretary', 'Chairman', 'Mayor'],
        active: true,
        creationDate: 1559054406455
      }
    ]
    it('returns full role list', async () => {
      fetch.mockResponseOnce(JSON.stringify(dummyRoleList))

      const response = await resolvers.Query.getRoles({}, {})

      expect(response).toEqual(dummyRoleList)
    })
    it('returns filtered role list', async () => {
      fetch.mockResponseOnce(JSON.stringify([dummyRoleList[2]]))

      const response = await resolvers.Query.getRoles(
        {},
        {
          sortBy: '_id',
          sortOrder: 'desc',
          title: 'Registrar',
          value: 'LOCAL_REGISTRAR',
          type: 'Mayor',
          active: true
        }
      )
      expect(response).toEqual([dummyRoleList[2]])
    })
  })
})
