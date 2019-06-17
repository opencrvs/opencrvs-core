import {
  searchComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { SearchResponse } from 'elasticsearch'
import { MATCH_SCORE_THRESHOLD } from '@search/constants'

export const enum EVENT {
  BIRTH = 'Birth',
  DEATH = 'Death'
}

export interface ICompositionBody {
  compositionId?: string
  event?: EVENT
  type?: string
  contactNumber?: string
  dateOfApplication?: string
  trackingId?: string
  registrationNumber?: string
  eventLocationId?: string
  applicationLocationId?: string
  rejectReason?: string
  rejectComment?: string
  relatesTo?: string[]
  childFirstNames?: string
  childFamilyName?: string
  childFirstNamesLocal?: string
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  modifiedAt?: string
}

export interface IBirthCompositionBody extends ICompositionBody {
  childFirstNames?: string
  childFamilyName?: string
  childFirstNamesLocal?: string
  childFamilyNameLocal?: string
  childDoB?: string
  gender?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherFirstNamesLocal?: string
  motherFamilyNameLocal?: string
  motherDoB?: string
  motherIdentifier?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherFirstNamesLocal?: string
  fatherFamilyNameLocal?: string
  fatherDoB?: string
  fatherIdentifier?: string
}

export interface IDeathCompositionBody extends ICompositionBody {
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedFirstNamesLocal?: string
  deceasedFamilyNameLocal?: string
  deathDate?: string
}

export async function detectDuplicates(
  compositionId: string,
  body: IBirthCompositionBody
) {
  const searchResponse = await searchComposition(body)
  const duplicates = findDuplicateIds(compositionId, searchResponse)
  return duplicates
}

export async function getCreatedBy(compositionId: string) {
  const results = await searchByCompositionId(compositionId)
  const result =
    results &&
    results.hits.hits &&
    (results.hits.hits[0] && (results.hits.hits[0]._source as ICompositionBody))

  return result && result.createdBy
}

function findDuplicateIds(
  compositionIdentifier: string,
  results: SearchResponse<unknown> | null
) {
  const hits = (results && results.hits.hits) || []
  return hits
    .filter(
      hit =>
        hit._id !== compositionIdentifier && hit._score > MATCH_SCORE_THRESHOLD
    )
    .map(hit => hit._id)
}

export function buildQuery(body: IBirthCompositionBody) {
  const must = []
  const should = []

  if (body.childFirstNames) {
    must.push({
      match: {
        childFirstNames: { query: body.childFirstNames, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.childFamilyName) {
    must.push({
      match: {
        childFamilyName: { query: body.childFamilyName, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.gender) {
    must.push({
      term: {
        gender: body.gender
      }
    })
  }

  if (body.childDoB) {
    must.push({
      term: {
        childDoB: body.childDoB
      }
    })
  }

  if (body.motherFirstNames) {
    should.push({
      match: {
        motherFirstNames: { query: body.motherFirstNames, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.motherFamilyName) {
    should.push({
      match: {
        motherFamilyName: { query: body.motherFamilyName, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.motherDoB) {
    should.push({
      term: {
        childDoB: body.motherDoB
      }
    })
  }

  if (body.motherIdentifier) {
    should.push({
      term: {
        motherIdentifier: {
          value: body.motherIdentifier,
          boost: 2
        }
      }
    })
  }

  if (body.fatherFirstNames) {
    should.push({
      match: {
        fatherFirstNames: { query: body.fatherFirstNames, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.fatherFamilyName) {
    should.push({
      match: {
        fatherFamilyName: { query: body.fatherFamilyName, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.fatherDoB) {
    should.push({
      term: {
        fatherDoB: body.fatherDoB
      }
    })
  }

  if (body.fatherIdentifier) {
    should.push({
      term: {
        fatherIdentifier: {
          value: body.fatherIdentifier,
          boost: 2
        }
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
