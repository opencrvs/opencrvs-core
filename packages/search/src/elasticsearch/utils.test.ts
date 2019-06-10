import { detectDuplicates, buildQuery } from '@search/elasticsearch/utils'
import { mockSearchResponse, mockCompositionBody } from '@search/test/utils'
import { searchComposition } from '@search/elasticsearch/dbhelper'

jest.mock('@search/elasticsearch/dbhelper.ts')

describe('elastic search utils', () => {
  it('should return an array of duplicate identifiers for a composition', async () => {
    ;(searchComposition as jest.Mock).mockReturnValue(mockSearchResponse)
    const duplicates = await detectDuplicates(
      'c79e8d62-335e-458d-9fcc-45ec5836c404',
      mockCompositionBody
    )
    expect(duplicates[0]).toEqual('c99e8d62-335e-458d-9fcc-45ec5836c404')
  })

  it('should build the search query for a composition', async () => {
    const query = await buildQuery(mockCompositionBody)
    expect(query.bool.must).toHaveLength(4)
    expect(query.bool.should).toHaveLength(8)
  })
})
