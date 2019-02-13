import { convertToMSISDN } from './utils'

describe('converToMSISDN', () => {
  it('should send the phone number as it is when it has country code as prefix', () => {
    const phone = '+8801711111111'
    expect(convertToMSISDN(phone)).toEqual(phone)
  })

  it('should attach country code when the phone number does not have the country code as prefix', async () => {
    const phone = '01711111111'
    expect(convertToMSISDN(phone)).toEqual(`+88${phone}`)
  })
})
