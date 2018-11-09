import TrackingId from './model/trackingId'
import {
  generateBirthTrackingId,
  generateDeathTrackingId
} from './trackingid-generator'

let findSpy: jest.Mock
let saveSpy: jest.Mock
describe('Verification of trackingId generator', () => {
  beforeEach(() => {
    findSpy = jest.spyOn(TrackingId, 'findOne').mockResolvedValueOnce(null)
    saveSpy = jest
      .spyOn(TrackingId.prototype, 'save')
      .mockImplementationOnce(() => {
        return { trackingId: 'B123456' }
      })
  })
  it('Generates proper birth tracking id successfully', async () => {
    const trackingId = await generateBirthTrackingId()

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^B/)
    expect(findSpy).toBeCalled()
    expect(saveSpy).toBeCalled()
  })

  it('In case of duplicate birth tracking id, it generates a new one', async () => {
    const dupFindSpy = jest
      .spyOn(TrackingId, 'findOne')
      .mockResolvedValueOnce({ trackingId: 'B323245' })

    const trackingId = await generateBirthTrackingId()

    expect(trackingId).toBeDefined()
    expect(trackingId).not.toBe('B323245')
    expect(dupFindSpy).toBeCalled()
    expect(saveSpy).toBeCalled()
  })

  it('Generates proper death tracking id successfully', async () => {
    const trackingId = await generateDeathTrackingId()

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^D/)
    expect(findSpy).toBeCalled()
    expect(saveSpy).toBeCalled()
  })
})
