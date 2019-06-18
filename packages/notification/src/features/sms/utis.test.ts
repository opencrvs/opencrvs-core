import { convertToMSISDN } from '@notification/features/sms/utils'

describe('converToMSISDN', () => {
  it('should send the phone number as it is when it has country code as prefix', () => {
    const phone = '+8801711111111'
    expect(convertToMSISDN(phone)).toEqual(phone)
  })

  it('should attach country code by replacing the starting 0, when the phone number does not have the country code as prefix and starts with 0', async () => {
    const phone = '01711111111'
    expect(convertToMSISDN(phone)).toEqual(`+88${phone}`)
  })

  it('should attach country code when the phone number does not have the country code as prefix and does not start with 0', async () => {
    const phone = '1711111111'
    expect(convertToMSISDN(phone)).toEqual(`+880${phone}`)
  })
})
