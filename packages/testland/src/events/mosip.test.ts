import { shouldForwardBirthRegistrationToMosip } from './mosip'
import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest'

describe('mosip integration tests', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    const mockDate = new Date(2025, 0, 1)
    vi.setSystemTime(mockDate)
  })
  afterAll(() => {
    vi.clearAllTimers()
  })
  describe('verify if the birth id creation logic works', () => {
    describe('should not forward to mosip', () => {
      test('when neither mother nor father is verified', () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'child.dob': '2024-3-2',
            'mother.verified': null,
            'father.verified': null
          })
        ).toBe(false)
      })
      test('when child is older than 10 years', () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'child.dob': '2014-12-31',
            'mother.verified': 'verified'
          })
        ).toBe(false)
      })
    })
    describe('should forward to mosip', () => {
      test('when child is below 10 years and mother or father is verified', () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'child.dob': '2020-5-5',
            'mother.verified': 'verified'
          })
        ).toBe(true)
      })
    })
  })
})
