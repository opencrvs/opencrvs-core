import User, { IUserModel } from '../../model/user'
import { createServer } from '../..'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { DocumentQuery } from 'mongoose'

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
const dummyUserList = [
  {
    name: 'Sakib Al Hasan',
    username: 'sakibal.hasan',
    mobile: '+8801711111111',
    email: 'test@test.org',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    role: 'Field Agent',
    active: true,
    creationDate: 1559054406433
  },
  {
    name: 'Md. Ariful Islam',
    username: 'mdariful.islam',
    mobile: '+8801740012994',
    email: 'test@test.org',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    role: 'Field Agent',
    active: true,
    creationDate: 1559054406444
  },
  {
    name: 'Mohammad Ashraful',
    username: 'mohammad.ashraful',
    mobile: '+8801733333333',
    email: 'test@test.org',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    role: 'Local Registrar',
    active: true,
    creationDate: 1559054406555
  }
]
describe('searchUsers tests', () => {
  it('Successfully returns full user list', async () => {
    User.find = jest.fn().mockReturnValue(dummyUserList)
    User.find().skip = jest.fn().mockReturnValue(dummyUserList)
    User.find().skip(0).limit = jest.fn().mockReturnValue(dummyUserList)
    User.find()
      .skip(0)
      .limit(10).sort = jest.fn().mockReturnValue(dummyUserList)
    User.find().count = jest.fn().mockReturnValue(dummyUserList.length)

    const res = await server.server.inject({
      method: 'POST',
      url: '/searchUsers',
      payload: { count: 10, skip: 0, sortOrder: 'desc' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.totalItems).toBe(dummyUserList.length)
    expect(res.result.results).toEqual(dummyUserList)
  })
  it('Successfully returns filtered user list', async () => {
    const filteredUserList = [dummyUserList[2]]
    User.find = jest.fn().mockReturnValue(filteredUserList)
    User.find().skip = jest.fn().mockReturnValue(filteredUserList)
    User.find().skip(0).limit = jest.fn().mockReturnValue(filteredUserList)
    User.find()
      .skip(0)
      .limit(10).sort = jest.fn().mockReturnValue(filteredUserList)
    User.find().count = jest.fn().mockReturnValue(filteredUserList.length)

    const res = await server.server.inject({
      method: 'POST',
      url: '/searchUsers',
      payload: {
        count: 10,
        skip: 0,
        sortOrder: 'asc',
        username: 'mohammad.ashraful',
        mobile: '+8801733333333',
        role: 'Local Registrar',
        active: true
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.results).toEqual(filteredUserList)
  })
})
