import { detectDuplicates, buildQuery } from 'src/elasticsearch/utils'
import {
  mockComposition,
  mockSearchResponse,
  mockCompositionBody
} from 'src/test/utils'
import { searchComposition } from 'src/elasticsearch/dbhelper'

jest.mock('src/elasticsearch/dbhelper.ts')

describe('elastic search utils', async () => {
  it('should return an array of duplicate identifiers for a composition', async () => {
    searchComposition.mockReturnValue(mockSearchResponse)

    const duplicates = await detectDuplicates(
      'c79e8d62-335e-458d-9fcc-45ec5836c404',
      mockComposition
    )
    expect(duplicates[0]).toEqual('c99e8d62-335e-458d-9fcc-45ec5836c404')
  })

  it('should build the search query for a composition', async () => {
    const query = await buildQuery(mockCompositionBody)
    expect(query.bool.must).toHaveLength(4)
    expect(query.bool.should).toHaveLength(8)
  })
})
