import {
  indexComposition,
  updateComposition,
  searchComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { mockCompositionBody } from '@search/test/utils'
import { client } from '@search/elasticsearch/client'
import { logger } from '@search/logger'
import { IBirthCompositionBody } from '@search/elasticsearch/utils'

describe('elasticsearch db helper', async () => {
  let indexSpy: jest.SpyInstance<any, any[]>
  let updateSpy: jest.SpyInstance<any, any[]>
  let searchSpy: jest.SpyInstance<any, any[]>

  describe('elasticsearch db helper', () => {
    beforeAll(() => {
      logger.error = jest.fn()
    })

    it('should index a composition with proper configuration', async () => {
      indexSpy = jest.spyOn(client, 'index')
      indexComposition('testId', mockCompositionBody)

      expect(indexSpy).toBeCalled()
      expect(indexSpy).toBeCalledWith({
        body: mockCompositionBody,
        id: 'testId',
        index: 'ocrvs',
        type: 'compositions'
      })
    })

    it('should update a composition with proper configuration', async () => {
      const body: IBirthCompositionBody = {
        childFirstNames: 'testValue'
      }
      updateSpy = jest.spyOn(client, 'update')
      updateComposition('testId', body)
      expect(updateSpy).toBeCalled()
      expect(updateSpy).toBeCalledWith({
        index: 'ocrvs',
        type: 'compositions',
        id: 'testId',
        body: {
          doc: body
        }
      })
    })

    it('should perform search for composition', async () => {
      searchSpy = jest.spyOn(client, 'search')
      searchComposition(mockCompositionBody)
      if (
        searchSpy.mock &&
        searchSpy.mock.calls[0] &&
        searchSpy.mock.calls[0][0]
      ) {
        expect(searchSpy.mock.calls[0][0].body.query).toBeDefined()
      } else {
        throw new Error('Failed')
      }
      expect(searchSpy).toBeCalled()
    })

    it('should perform search by compostion id', async () => {
      searchByCompositionId('r1324-sd6k2-12121-1212')
      expect(searchSpy.mock.calls[0][0].body.query).toBeDefined()
      expect(searchSpy).toBeCalled()
    })

    afterAll(() => {
      indexSpy.mockRestore()
      searchSpy.mockRestore()
    })
  })
})
