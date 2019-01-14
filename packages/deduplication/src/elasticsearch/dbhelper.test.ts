import { indexComposition, searchComposition } from 'src/elasticsearch/dbhelper'
import { mockCompositionBody } from 'src/test/utils'
import { client } from 'src/elasticsearch/client'

describe('elasticsearch db helper', async () => {
  let indexSpy
  let searchSpy

  beforeAll(() => {
    indexSpy = jest.spyOn(client, 'index')
    searchSpy = jest.spyOn(client, 'search')
  })

  it('should index a composition with proper configuration', async () => {
    indexComposition('testId', mockCompositionBody)
    expect(indexSpy).toBeCalled()
    expect(indexSpy).toBeCalledWith({
      body: mockCompositionBody,
      id: 'testId',
      index: 'ocrvs',
      type: 'compositions'
    })
  })

  it('should perform search for composition', async () => {
    searchComposition(mockCompositionBody)
    expect(searchSpy.mock.calls[0][0].body.query).toBeDefined()
    expect(searchSpy).toBeCalled()
  })

  afterAll(() => {
    indexSpy.mockRestore()
    searchSpy.mockRestore()
  })
})
