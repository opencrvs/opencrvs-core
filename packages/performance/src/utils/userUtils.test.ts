import { getUserDetails, getUserLocation } from '@performance/utils/userUtils'
import { user, userDetails } from '@performance/tests/util'
import { cloneDeep } from 'lodash'

describe('getUserDetails', () => {
  it('returns the correctly formatted user details', () => {
    expect(getUserDetails(user)).toEqual(userDetails)
  })
})

describe('getUserLocation', () => {
  it('returns the correct location', () => {
    expect(getUserLocation(userDetails, 'UNION')).toEqual('123456789')
  })

  it('returns empty location in case of invalid location key', () => {
    expect(getUserLocation(userDetails, 'INVALID')).toEqual('')
  })
  it('Throws error if catchmentArea is missing for loggedin user', () => {
    const clonedDetails = cloneDeep(userDetails)
    delete clonedDetails.catchmentArea
    expect(() => getUserLocation(clonedDetails, 'UNION')).toThrowError(
      'The user has no catchment area'
    )
  })
  it('Throws error in-case of missing identifier of catchementArea', () => {
    const clonedDetails = cloneDeep(userDetails)
    delete clonedDetails.catchmentArea[3].identifier
    expect(() => getUserLocation(clonedDetails, 'UNION')).toThrowError(
      'The catchment area has no identifier'
    )
  })
})
