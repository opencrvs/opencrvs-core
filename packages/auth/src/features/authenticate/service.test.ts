import {
  verifyToken,
  getStoredUserInformation,
  UserInfoNotFoundError
} from './service'

describe('authenticate service errors', () => {
  describe('verifyToken - token expired', () => {
    it('returns a JWT Error for an expired token', async () => {
      expect.assertions(1)
      const expiredToken =
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY2h3IiwiaWF0IjoxNTMwNzc2OTYxLCJleHAiOjE1MzA3Nzc1NjEsInN1YiI6IjViMzI1YTYyMGVmNDgxM2UzMDhhNDMxMyJ9.leJuSng-PmQvFCS-FrIl9-Z2iYitwuX274QHkDoVQGmHtfi9SsKIRmZ1OlNRS6g7eT4LvvUDjwBZvCO7Rvhf_vnrHmHE4JR_e9MWVoK_0vjxCkDmo-cZ6iM7aBzrB4-F1eaaZJwxrwPFY5o_rsxCAeHj-draVYQTEr388y-rffdaC7IHoHhTrGoj8n40d8RyvX7UVVG5w1zsxFhYlN44zvMDNy56zGpbJ7mNn3M6hJWGUjDaOhtsEpfyDeoeiuEkU4Rn_WxtbognqLt12P6TQWsQOy_eHqR2UfBdmPw_uSW28FFQh9ebOEjMSI0JnIFXagrWkkFVO2DcBh8YlGE5M_fZWrrkz9pTiVb1KQWTz_TPUf8VVlTRNBKCnumiQJRIkWNxIecYwKap_HpKd5SaD8sLgB3htmomfJE4h4nu-7Tjy_QYw_2Sm4upDCEcB-mjx_EeIVTQXk5Re3QMhY1hEh9tD0kDhJudPQWBG7g8GQy2ZBmy6CtP7FQ-tRdyOE_0TNazZSB4Ogz8im5c2ZSVRWalPZWp0TupiSWI5sY-k_Qab6hpbxAFxqsH-8eRelos4y9Ohh60mpNNIqZkizSLfoWKgR5tMBkyDbMPbfbDUEKYKSa5b29uCeAHeJXvW-A0Nk5YwiPNZIe2ycuVaWUaDnL3vvbb5yrTG1eDuhFm_xw'

      return verifyToken(expiredToken).then(data =>
        expect(data.name).toEqual('TokenExpiredError')
      )
    })
    it('returns an Error for a malformed token', async () => {
      expect.assertions(1)
      const badToken = 'ytfhgfgf'
      return verifyToken(badToken).catch((e: Error) =>
        expect(e.message).toEqual('jwt malformed')
      )
    })
  })

  describe('getStoredUserInformation - cannot find a user', () => {
    it('returns an Error if a user cannot be found', async () => {
      expect.assertions(1)
      const badNonce = 'ytfhgfjhgf'
      return getStoredUserInformation(badNonce).catch(
        (e: UserInfoNotFoundError) => {
          expect(e.message).toEqual('user not found')
        }
      )
    })
  })
})
