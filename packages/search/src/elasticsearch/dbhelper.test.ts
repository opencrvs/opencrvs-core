import {
  indexComposition,
  updateComposition,
  searchComposition,
  searchByCompositionId
} from 'src/elasticsearch/dbhelper'
import { mockCompositionBody } from 'src/test/utils'
import { client } from 'src/elasticsearch/client'

describe('elasticsearch db helper', async () => {
  let indexSpy
  let updateSpy
  let searchSpy

  beforeAll(() => {
    indexSpy = jest.spyOn(client, 'index')
    updateSpy = jest.spyOn(client, 'update')
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

  it('should update a composition with proper configuration', async () => {
    const body = {
      testKey: 'testValue'
    }
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
    searchComposition(mockCompositionBody)
    expect(searchSpy.mock.calls[0][0].body.query).toBeDefined()
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
