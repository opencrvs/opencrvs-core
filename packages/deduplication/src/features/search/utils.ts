export function queryBuilder(query: string, searchableFields: string[]) {
  const must: any[] = []
  const should: any[] = []
  const EMPTY_STRING = ''

  if (query !== EMPTY_STRING) {
    must.push({
      multi_match: {
        query: `${query}`,
        fields: searchableFields,
        fuzziness: 'AUTO'
      }
    })
  }

  return {
    bool: {
      must,
      should
    }
  }
}
