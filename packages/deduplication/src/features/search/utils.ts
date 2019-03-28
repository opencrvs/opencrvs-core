import { IFilter } from './types'
const SEARCHABLE_FIELDS = [
  'childFirstNames',
  'childFamilyName',
  'childFirstNamesLocal',
  'childFamilyNameLocal',
  'deceasedFirstNames',
  'deceasedFamilyName',
  'deceasedFirstNamesLocal',
  'deceasedFamilyNameLocal',
  'trackingid',
  'registrationNumber',
  'contactNumber',
  'motherIdentifier'
]

export function queryBuilder(query: string, filters: IFilter) {
  const must: any[] = []
  const should: any[] = []
  const EMPTY_STRING = ''

  if (query !== EMPTY_STRING) {
    must.push({
      multi_match: {
        query: `${query}`,
        fields: SEARCHABLE_FIELDS,
        fuzziness: 'AUTO'
      }
    })
  }

  if (filters.event !== EMPTY_STRING) {
    must.push({
      match: {
        event: filters.event
      }
    })
  }

  if (filters.status !== EMPTY_STRING) {
    must.push({
      match: {
        type: filters.status
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
