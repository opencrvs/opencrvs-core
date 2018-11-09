import {
  pushTrackingId,
  getMsisdn,
  getInformantName
} from './birth-declaration-helper'
import TrackingId from './model/trackingId'

describe('Birth declaration helper', () => {
  const details = {
    child: {
      name: [{ use: 'Traditional', firstNames: 'অনিক', familyName: 'হক' }]
    },
    mother: {
      name: [{ use: 'Traditional', firstNames: 'তাহসিনা', familyName: 'হক' }],
      telecom: [{ system: 'phone', value: '+8801622688231' }]
    },
    father: {
      name: [{ use: 'Traditional', firstNames: 'মাজহারুল', familyName: 'হক' }]
    },
    registration: { contact: 'MOTHER' },
    createAt: new Date()
  }
  describe('pushTrackingId ()', () => {
    it('returns passed input with a tracking id', async () => {
      const findSpy = jest
        .spyOn(TrackingId, 'findOne')
        .mockResolvedValueOnce(null)
      const saveSpy = jest
        .spyOn(TrackingId.prototype, 'save')
        .mockImplementationOnce(() => {
          return { trackingId: 'B123456' }
        })

      const result = await pushTrackingId(details)

      expect(result).toBeDefined()
      expect(result.registration.trackingId).toBeDefined()
      expect(result.registration.trackingId.length).toBe(7)
      expect(result.registration.trackingId).toMatch(/^B/)
      expect(findSpy).toBeCalled()
      expect(saveSpy).toBeCalled()
    })
  })
  describe('getMsisdn ()', () => {
    it('returns the right phone number', () => {
      const result = getMsisdn(details)

      expect(result).toBeDefined()
      expect(result).toBe('+8801622688231')
    })
    it('throws error if not contact point is provided for informant', () => {
      expect(() => getMsisdn({ ...details, registration: {} })).toThrowError(
        "Didn't recieved the information for informant's shared contact"
      )
    })
    it('throws error if invalid contact point is provided for informant', () => {
      expect(() =>
        getMsisdn({ ...details, registration: { contact: 'INVALID' } })
      ).toThrowError(
        "Invalid information recieved for informant's shared contact"
      )
    })
    it('throws error if no contact point is defined selected contact point of informant', () => {
      expect(() =>
        getMsisdn({ ...details, registration: { contact: 'FATHER' } })
      ).toThrowError(
        "Didn't find any contact point for informant's shared contact"
      )
    })
    it('throws error if no phone number is defined selected contact point of informant', () => {
      expect(() =>
        getMsisdn({
          ...details,
          registration: { contact: 'FATHER' },
          father: { telecom: [{ system: 'email', value: 'anikgnr@gmail.com' }] }
        })
      ).toThrowError(
        "Didn't find any phone number for informant's shared contact"
      )
    })
  })
  describe('getInformantName ()', () => {
    it('returns the proper informant name', () => {
      const result = getInformantName(details)

      expect(result).toBeDefined()
      expect(result).toBe('অনিক হক')
    })
  })
  it('throws error if no name is provided for child', () => {
    expect(() =>
      getInformantName({
        ...details,
        child: {}
      })
    ).toThrowError("Didn't recieved informant's name information")
  })
  it('throws error if no traditional name is provided for child', () => {
    expect(() =>
      getInformantName({
        ...details,
        child: {
          name: [{ use: 'English', firstNames: 'Anik', familyName: 'Hoque' }]
        }
      })
    ).toThrowError("Didn't found informant's traditional name")
  })
})
