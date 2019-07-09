import { roleTypeResolvers } from '@gateway/features/role/type-resovlers'
import * as fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

describe('Role type resolvers', () => {
  const mockResponse = {
    _id: 'ba7022f0ff4822',
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    types: ['Hospital', 'CHA'],
    active: true,
    creationDate: 1559054406433
  }
  it('return id type', () => {
    const res = roleTypeResolvers.Role.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
})
