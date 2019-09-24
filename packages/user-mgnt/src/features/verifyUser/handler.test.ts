import User from '@user-mgnt/model/user'
import { createServer } from '@user-mgnt/index'
import mockingoose from 'mockingoose'

let server: any

beforeEach(async () => {
  server = await createServer()
})

test("verifyUserHandler should throw with 401 when user doesn't exist", async () => {
  const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(null)

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { mobile: '+8801711111111' }
  })

  expect(res.result.statusCode).toBe(401)
  expect(spy).toBeCalled()
})

test('verifyUserHandler should return 200 and the user scope when the user exists', async () => {
  const entry = {
    mobile: '+8801711111111',
    scope: ['test'],
    id: '123'
  }
  mockingoose(User).toReturn(entry, 'findOne')

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { mobile: '+8801711111111' }
  })

  expect([...res.result.scope]).toMatchObject(['test'])
})

test('verifyUserHandler should throw when User.findOne throws', async () => {
  const spy = jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
    throw new Error('boom')
  })
  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { mobile: '+8801711111111' }
  })
  expect(res.result.statusCode).toBe(500)

  expect(spy).toBeCalled()
})
