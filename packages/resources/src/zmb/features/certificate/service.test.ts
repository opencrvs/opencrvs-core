import { getCollectorFields } from '@resources/zmb/features/certificate/service'

describe('collector service', () => {
  it('returns collector fields in a simplified format', async () => {
    const fields = await getCollectorFields()
    expect(fields).toBeDefined()
  })
})
