import {
  generateVerificationCode,
  getVerificationCodeDetails,
  generateNonce
} from './service'

const nonce = '12345'
const mobile = '+447111111111'

describe('verifyCode service', () => {
  describe('generateVerificationCode', () => {
    it('generates a pseudo random 6 digit code', async () => {
      const code = expect.stringMatching(/^\d{6}$/)
      return generateVerificationCode(nonce, mobile).then(data => {
        expect(data).toEqual(code)
      })
    })
  })
  describe('getVerificationCodeDetails', () => {
    it('stores and returns a valid code object', async () => {
      Date.now = jest.fn(() => 1487076708000)
      const codeDetails = {
        code: expect.stringMatching(/^\d{6}$/),
        createdAt: 1487076708000
      }
      await generateVerificationCode(nonce, mobile)
      return getVerificationCodeDetails(nonce).then(data => {
        expect(data).toEqual(codeDetails)
      })
    })
  })
  describe('generateNonce', () => {
    it('generates a valid cryptographic nonce', () => {
      const cryptoString = expect.stringMatching(/^\S{24}$/)
      expect(generateNonce()).toEqual(cryptoString)
    })
  })
})
