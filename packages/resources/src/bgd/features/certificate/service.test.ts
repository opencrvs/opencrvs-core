import { getCollectorFields } from '@resources/bgd/features/certificate/service'

describe('collector service', () => {
  it('returns collector in a simplified format', async () => {
    const facilities = await getCollectorFields()
    expect(facilities).toBeDefined()
  })
})
