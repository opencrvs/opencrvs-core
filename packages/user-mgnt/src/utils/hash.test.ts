import { generateRandomPassowrd } from '@user-mgnt/utils/hash'

describe('Check password generator', () => {
  it('generates a hardcoded password for demo user', () => {
    expect(generateRandomPassowrd(true)).toEqual('test')
  })
  it('generates a 6 chars length password for other users', () => {
    expect(generateRandomPassowrd(false)).toHaveLength(6)
  })
})
