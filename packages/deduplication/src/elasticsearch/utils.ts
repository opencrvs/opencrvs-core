import { searchComposition } from 'src/elasticsearch/dbhelper'
import { SearchResponse } from 'elasticsearch'
import { MATCH_SCORE_THRESHOLD } from 'src/constants'

export interface ICompositionBody {
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

export async function detectDuplicates(
  compositionIdentifier: string,
  body: ICompositionBody
) {
  const searchResponse = await searchComposition(body)
  const duplicates = findDuplicates(compositionIdentifier, searchResponse)
  return duplicates
}

function findDuplicates(compositionId: string, results: SearchResponse<{}>) {
  const hits = results.hits.hits
  return hits
    .filter(
      hit => hit._id !== compositionId && hit._score > MATCH_SCORE_THRESHOLD
    )
    .map(hit => hit._id)
}

export function buildQuery(body: ICompositionBody) {
  const must = []
  const should = []

  if (body.childFirstNames) {
    must.push({
      fuzzy: {
        childFirstNames: body.childFirstNames
      }
    })
  }

  if (body.childFamilyName) {
    must.push({
      fuzzy: {
        childFamilyName: body.childFamilyName
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
      fuzzy: {
        motherFirstNames: body.motherFirstNames
      }
    })
  }

  if (body.motherFamilyName) {
    should.push({
      fuzzy: {
        motherFamilyName: body.motherFamilyName
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
      fuzzy: {
        fatherFirstNames: body.fatherFirstNames
      }
    })
  }

  if (body.fatherFamilyName) {
    should.push({
      fuzzy: {
        fatherFamilyName: body.fatherFamilyName
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
