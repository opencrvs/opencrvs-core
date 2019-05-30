import { resolvers } from '@gateway/features/notification/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Notification root resolvers', () => {
  describe('listNotifications()', () => {
    it('returns an array of composition results', async () => {
      fetch.mockResponseOnce(JSON.stringify({ entry: [{}, {}] }))
      // @ts-ignore
      const compositions = await resolvers.Query.listNotifications(
        {},
        { status: 'preliminary' }
      )

      expect(compositions).toBeDefined()
      expect(compositions).toBeInstanceOf(Array)
      expect(compositions).toHaveLength(2)
    })
  })
  describe('createNotification', () => {
    it('posting the mutation', async () => {
      // @ts-ignore
      const result = await resolvers.Mutation.createNotification(
        {},
        { details: new Date() }
      )

      expect(result).toBeDefined()
    })
  })
})
