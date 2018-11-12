import { generateBirthTrackingId, generateDeathTrackingId } from './utils'

describe('Verification of trackingId generator', () => {
  it('Generates proper birth tracking id successfully', async () => {
    const trackingId = generateBirthTrackingId()

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^B/)
  })

  it('Generates proper death tracking id successfully', async () => {
    const trackingId = generateDeathTrackingId()

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^D/)
  })
})
