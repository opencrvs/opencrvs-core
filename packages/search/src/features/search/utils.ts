import { IFilter } from '@search/features/search/types'
const SEARCHABLE_FIELDS = [
  'childFirstNames',
  'childFamilyName',
  'childFirstNamesLocal',
  'childFamilyNameLocal',
  'deceasedFirstNames',
  'deceasedFamilyName',
  'deceasedFirstNamesLocal',
  'deceasedFamilyNameLocal',
  'trackingId',
  'registrationNumber',
  'contactNumber'
]
export const EMPTY_STRING = ''

export function queryBuilder(
  query: string,
  trackingId: string,
  contactNumber: string,
  registrationNumber: string,
  applicationLocationId: string,
  createdBy: string,
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

  if (trackingId !== EMPTY_STRING) {
    must.push({
      term: {
        'trackingId.keyword': trackingId
      }
    })
  }

  if (contactNumber !== EMPTY_STRING) {
    must.push({
      term: {
        'contactNumber.keyword': contactNumber
      }
    })
  }

  if (registrationNumber !== EMPTY_STRING) {
    must.push({
      term: {
        'registrationNumber.keyword': registrationNumber
      }
    })
  }

  if (applicationLocationId !== EMPTY_STRING) {
    must.push({
      term: {
        'applicationLocationId.keyword': {
          value: applicationLocationId,
          // tslint:disable-next-line
          boost: 2.0
        }
      }
    })
  }

  if (createdBy !== EMPTY_STRING) {
    must.push({
      term: {
        'createdBy.keyword': {
          value: createdBy
        }
      }
    })
  }

  if (filters.event !== EMPTY_STRING) {
    must.push({
      term: {
        'event.keyword': filters.event
      }
    })
  }

  if (filters.status !== EMPTY_STRING) {
    must.push({
      term: {
        'type.keyword': filters.status
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
