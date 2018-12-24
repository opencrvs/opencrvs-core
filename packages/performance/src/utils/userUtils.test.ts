import { getUserDetails } from './userUtils'
import { user, userDetails } from '../tests/util'

describe('getUserDetails', () => {
  it('returns the correctly formatted user details', () => {
    expect(getUserDetails(user)).toEqual(userDetails)
  })
})
