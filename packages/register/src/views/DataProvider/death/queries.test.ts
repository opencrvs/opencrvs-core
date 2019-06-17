import {
  GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
  getDeathQueryMappings
} from '@register/views/DataProvider/death/queries'
import { Action } from '@register/forms'

describe('When calling getDeathQueryMappings', () => {
  it('Should return the Query for certification', () => {
    const query = getDeathQueryMappings(Action.LOAD_CERTIFICATE_APPLICATION)
    expect(query).not.toBe(null)
    if (query && query.query) {
      expect(query.query).toEqual(GET_DEATH_REGISTRATION_FOR_CERTIFICATION)
    } else {
      throw new Error('Failed')
    }
  })

  it('Should return null', () => {
    const query = getDeathQueryMappings(Action.SUBMIT_FOR_REVIEW)
    expect(query).toBe(null)
  })
})
