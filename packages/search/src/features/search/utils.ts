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
  'contactNumber'
]
export const EMPTY_STRING = ''

export function queryBuilder(
  query: string,
  applicationLocationId: string,
  filters: IFilter
) {
  const must: any[] = []
  const should: any[] = []

  if (query !== EMPTY_STRING) {
    must.push({
      multi_match: {
        query: `${query}`,
        fields: SEARCHABLE_FIELDS,
        fuzziness: 'AUTO'
      }
    })
  }

  if (applicationLocationId !== EMPTY_STRING) {
    must.push({
      match: {
        applicationLocationId
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
