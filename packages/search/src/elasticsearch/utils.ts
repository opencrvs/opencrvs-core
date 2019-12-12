/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { MATCH_SCORE_THRESHOLD, USER_MANAGEMENT_URL } from '@search/constants'
import {
  searchByCompositionId,
  searchComposition
} from '@search/elasticsearch/dbhelper'
import {
  findName,
  findTaskExtension,
  getFromFhir
} from '@search/features/fhir/fhir-utils'
import { SearchResponse } from 'elasticsearch'
import fetch from 'node-fetch'

export const enum EVENT {
  BIRTH = 'Birth',
  DEATH = 'Death'
}

export const NAME_EN = 'en'
export const NAME_BN = 'bn'

export interface IOperationHistory {
  operationType: string
  operatedOn: string
  operatorRole: string
  operatorFirstNames: string
  operatorFamilyName: string
  operatorFirstNamesLocale: string
  operatorFamilyNameLocale: string
  operatorOfficeName: string
  operatorOfficeAlias: string[]
  rejectReason?: string
  rejectComment?: string
}

export interface ICompositionBody {
  compositionId?: string
  compositionType?: string
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
  operationHistories?: IOperationHistory[]
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
  informantFirstNames?: string
  informantFamilyName?: string
  informantFirstNamesLocal?: string
  informantFamilyNameLocal?: string
  primaryCaregiverFirstNames?: string
  primaryCaregiverFamilyName?: string
  primaryCaregiverFirstNamesLocal?: string
  primaryCaregiverFamilyNameLocal?: string
}

export interface IDeathCompositionBody extends ICompositionBody {
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedFirstNamesLocal?: string
  deceasedFamilyNameLocal?: string
  deathDate?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherFirstNamesLocal?: string
  motherFamilyNameLocal?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherFirstNamesLocal?: string
  fatherFamilyNameLocal?: string
  spouseFirstNames?: string
  spouseFamilyName?: string
  spouseFirstNamesLocal?: string
  spouseFamilyNameLocal?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantFirstNamesLocal?: string
  informantFamilyNameLocal?: string
}

interface IUserModelData {
  _id: string
  role: string
  name: fhir.HumanName[]
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

export const getStatus = async (compositionId: string) => {
  const results = await searchByCompositionId(compositionId)
  const result =
    results &&
    results.hits.hits &&
    (results.hits.hits[0] && (results.hits.hits[0]._source as ICompositionBody))

  return (result && result.operationHistories) as IOperationHistory[]
}

export const createStatusHistory = async (
  body: ICompositionBody,
  task: fhir.Task | undefined,
  authHeader: string
) => {
  const user: IUserModelData = await getUser(body.updatedBy || '', authHeader)
  const operatorName = user && findName(NAME_EN, user.name)
  const operatorNameLocale = user && findName(NAME_BN, user.name)

  const operatorFirstNames =
    operatorName && operatorName.given && operatorName.given.join(' ')
  const operatorFamilyName =
    operatorName && operatorName.family && operatorName.family
  const operatorFirstNamesLocale =
    operatorNameLocale &&
    operatorNameLocale.given &&
    operatorNameLocale.given.join(' ')
  const operatorFamilyNameLocale =
    operatorNameLocale && operatorNameLocale.family && operatorNameLocale.family

  const regLasOfficeExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastOffice'
  )
  const regLastOfficeReference =
    regLasOfficeExtension &&
    regLasOfficeExtension.valueReference &&
    regLasOfficeExtension.valueReference.reference
  const office: fhir.Location = await getFromFhir(`/${regLastOfficeReference}`)

  const operationHistory = {
    operationType: body.type,
    operatedOn: task && task.lastModified,
    rejectReason: body.rejectReason,
    rejectComment: body.rejectComment,
    operatorRole: user.role,
    operatorFirstNames,
    operatorFamilyName,
    operatorFirstNamesLocale,
    operatorFamilyNameLocale,
    operatorOfficeName: office.name,
    operatorOfficeAlias: office.alias
  } as IOperationHistory
  body.operationHistories = body.operationHistories || []
  body.operationHistories.push(operationHistory)
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

export async function getUser(practitionerId: string, authHeader: any) {
  const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
    method: 'POST',
    body: JSON.stringify({
      practitionerId
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader
    }
  })
  return await res.json()
}
