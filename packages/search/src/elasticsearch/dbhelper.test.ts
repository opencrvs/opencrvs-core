import {
  indexComposition,
  updateComposition,
  searchComposition
} from '@search/elasticsearch/dbhelper'
import { mockCompositionBody } from '@search/test/utils'
import { client } from '@search/elasticsearch/client'
import { logger } from '@search/logger'
import { IBirthCompositionBody } from '@search/elasticsearch/utils'

describe('elasticsearch db helper', () => {
  beforeAll(() => {
    logger.error = jest.fn()
  })

  it('should index a composition with proper configuration', async () => {
    const indexSpy = jest.spyOn(client, 'index')
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
    const updateSpy = jest.spyOn(client, 'update')
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
    const searchSpy = jest.spyOn(client, 'search')
    searchComposition(mockCompositionBody)
    if (
      searchSpy.mock &&
      searchSpy.mock.calls[0] &&
      searchSpy.mock.calls[0][0]
    ) {
      expect(searchSpy.mock.calls[0][0].body.query).toBeDefined()
    }
    expect(searchSpy).toBeCalled()
  })
})
