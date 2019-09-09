import { generateRandomPassword } from '@user-mgnt/utils/hash'

describe('Check password generator', () => {
  it('generates a hardcoded password for demo user', () => {
    expect(generateRandomPassword(true)).toEqual('test')
  })
  it('generates a 6 chars length password for other users', () => {
    expect(generateRandomPassword(false)).toHaveLength(6)
  })
})
