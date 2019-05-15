import { validate, localPhoneNumberSchema, msisdnSchema, convertToMSISDN, convertToLocalPhoneNumber } from './index'

describe('localPhoneNumberSchema', () => {
  it('should successfully validate a phone number', () => {
    expect(validate('0845558384', localPhoneNumberSchema).error).toBe(null)
    expect(validate('0183431000', localPhoneNumberSchema).error).toBe(null)
    expect(validate('07712345678', localPhoneNumberSchema).error).toBe(null)
  })

  it('should fail to validate an incorrect phone number', () => {
    expect(validate('845558384', localPhoneNumberSchema).error).toBeTruthy()
    expect(validate('01834310000000000000000', localPhoneNumberSchema).error).toBeTruthy()
    expect(validate('+07712345678', localPhoneNumberSchema).error).toBeTruthy()
  })
})

describe('msisdnSchema', () => {
  it('should sucessfully validate msisdn', () => {
    expect(validate('+27845558384', msisdnSchema).error).toBe(null)
    expect(validate('+880183431000', msisdnSchema).error).toBe(null)
    expect(validate('+447712345678', msisdnSchema).error).toBe(null)
  })

  it('should fail to validate an incorrect phone number', () => {
    expect(validate('845558384', msisdnSchema).error).toBeTruthy()
    expect(validate('01834310000000000000000', msisdnSchema).error).toBeTruthy()
    expect(validate('+07712', msisdnSchema).error).toBeTruthy()
  })
})

describe('.convertToMSISDN()', () => {
  it('should convert local phone number to msisdn', () => {
    expect(convertToMSISDN('0845556688', 'za')).toBe('+27845556688')
  })

  it('should do nothing we number is already msisdn', () => {
    expect(convertToMSISDN('+27845556688', 'za')).toBe('+27845556688')
  })

  it('should throw an error if number is invalid', () => {
    expect(() => convertToMSISDN('1111111111111111111', 'za')).toThrow()
  })
})

describe('.convertToPhoneNumber()', () => {
  it('should convert MSISDN to local phone number', () => {
    expect(convertToLocalPhoneNumber('+27845556688', 'za')).toBe('0845556688')
  })

  it('should throw an error if number is invalid', () => {
    expect(() => convertToLocalPhoneNumber('++1111111111111', 'za')).toThrow()
  })
})
