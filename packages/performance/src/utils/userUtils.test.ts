import { getUserDetails, getUserLocation } from '@performance/utils/userUtils'
import { user, userDetails } from '@performance/tests/util'
import { cloneDeep } from 'lodash'
import { GQLUser } from '@opencrvs/gateway/src/graphql/schema'

describe('getUserDetails', () => {
  it('returns the correctly formatted user details', () => {
    expect(getUserDetails((user as unknown) as GQLUser)).toEqual(userDetails)
  })
})

describe('getUserLocation', () => {
  it('returns the correct location', () => {
    expect(getUserLocation(userDetails)).toEqual({
      id: '0627c48a-c721-4ff9-bc6e-1fba59a2332a'
    })
  })

  it('Throws error if primaryOffice is missing for loggedin user', () => {
    const clonedDetails = cloneDeep(userDetails)
    delete clonedDetails.primaryOffice
    expect(() => getUserLocation(clonedDetails)).toThrowError(
      'The user has no primary office'
    )
  })
})
