import * as authUtils from './authUtils'

describe('authUtils tests', () => {
  let mockValidToken: any
  let mockInvalidToken: any

  beforeEach(async () => {
    mockValidToken = {
      subject: '123',
      exp: new Date(new Date().getTime() / 1000 + 10 * 60000),
      role: 'test'
    }
    mockInvalidToken = {
      subject: '123',
      exp: new Date(new Date().getTime() / 1000 - 10 * 60000),
      role: 'chw'
    }
  })
  it('should confirm a token has not expired', () => {
    jest.spyOn(authUtils, 'getProfile').mockReturnValue(mockValidToken)
    expect(authUtils.isTokenStillValid('12345')).toEqual(true)
  })
  it('should confirm a token has expired', () => {
    jest.spyOn(authUtils, 'getProfile').mockReturnValue(mockInvalidToken)
    expect(authUtils.isTokenStillValid('12345')).toEqual(false)
  })
})
