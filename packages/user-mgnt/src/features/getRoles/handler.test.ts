import Role from '@user-mgnt/model/role'
import { createServer } from '@user-mgnt/index'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

let server: any

beforeEach(async () => {
  server = await createServer()
})

const token = jwt.sign(
  { scope: ['register'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)
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

describe('getRoles tests', () => {
  it('Successfully returns full role list', async () => {
    Role.find = jest.fn().mockReturnValue(dummyRoleList)
    Role.find().sort = jest.fn().mockReturnValue(dummyRoleList)

    const res = await server.server.inject({
      method: 'POST',
      url: '/getRoles',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.result).toEqual(dummyRoleList)
  })
  it('Successfully returns filtered user list', async () => {
    const filteredList = [dummyRoleList[2]]
    Role.find = jest.fn().mockReturnValue(filteredList)
    Role.find().sort = jest.fn().mockReturnValue(filteredList)

    const res = await server.server.inject({
      method: 'POST',
      url: '/getRoles',
      payload: {
        sortBy: '_id',
        sortOrder: 'desc',
        title: 'Registrar',
        value: 'LOCAL_REGISTRAR',
        type: 'Mayor',
        active: true
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result).toEqual(filteredList)
  })
})
