import { convertToMSISDN, generateRandomPassword } from '@resources/utils'

describe('Check password generator', () => {
  it('generates a hardcoded password for demo user', () => {
    expect(generateRandomPassword(true)).toEqual('test')
  })
  it('generates a 6 chars length password for other users', () => {
    expect(generateRandomPassword(false)).toHaveLength(6)
  })
})

describe('converToMSISDN', () => {
  it('should send the phone number as it is when it has country code as prefix', () => {
    const phone = '+8801711111111'
    expect(convertToMSISDN(phone, 'bgd')).toEqual(phone)
  })

  it('should attach country code by replacing the starting 0, when the phone number does not have the country code as prefix and starts with 0', async () => {
    const phone = '01711111111'
    expect(convertToMSISDN(phone, 'bgd')).toEqual(`+88${phone}`)
  })

  it('should attach country code when the phone number does not have the country code as prefix and does not start with 0', async () => {
    const phone = '1711111111'
    expect(convertToMSISDN(phone, 'bgd')).toEqual(`+880${phone}`)
  })
})
