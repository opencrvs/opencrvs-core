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
  findNameLocale,
  findTaskExtension,
  getFromFhir
} from '@search/features/fhir/fhir-utils'
import { ISearchResponse } from '@search/elasticsearch/client'
import { ApiResponse } from '@elastic/elasticsearch'
import fetch from 'node-fetch'

export const enum EVENT {
  BIRTH = 'Birth',
  DEATH = 'Death'
}

export const IN_PROGRESS_STATUS = 'IN_PROGRESS'
const DECLARED_STATUS = 'DECLARED'
export const REJECTED_STATUS = 'REJECTED'
const VALIDATED_STATUS = 'VALIDATED'
const WAITING_VALIDATION_STATUS = 'WAITING_VALIDATION'
const REGISTERED_STATUS = 'REGISTERED'
const CERTIFIED_STATUS = 'CERTIFIED'
const REQUESTED_CORRECTION_STATUS = 'REQUESTED_CORRECTION'

export const NOTIFICATION_TYPES = ['birth-notification', 'death-notification']
export const NAME_EN = 'en'

export interface ICorrection {
  section: string
  fieldName: string
  oldValue: string
  newValue: string
}
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
  notificationFacilityName?: string
  notificationFacilityAlias?: string[]
  correction?: ICorrection[]
}

export interface ICompositionBody {
  compositionId?: string
  compositionType?: string
  event?: EVENT
  type?: string
  contactRelationship?: string
  contactNumber?: string
  dateOfApplication?: string
  trackingId?: string
  registrationNumber?: string
  eventLocationId?: string
  applicationLocationId?: string
  applicationLocationHirarchyIds?: string[]
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
  const result = results?.body?.hits?.hits[0]?._source as ICompositionBody
  return result?.createdBy
}

export const getStatus = async (compositionId: string) => {
  const results = await searchByCompositionId(compositionId)
  const result = results?.body?.hits?.hits[0]?._source as ICompositionBody
  return result?.operationHistories as IOperationHistory[]
}

export const createStatusHistory = async (
  body: ICompositionBody,
  task: fhir.Task | undefined,
  authHeader: string
) => {
  if (!isValidOperationHistory(body)) {
    return
  }

  const user: IUserModelData = await getUser(body.updatedBy || '', authHeader)
  const operatorName = user && findName(NAME_EN, user.name)
  const operatorNameLocale = user && findNameLocale(user.name)

  const operatorFirstNames = operatorName?.given?.join(' ') || ''
  const operatorFamilyName = operatorName?.family || ''
  const operatorFirstNamesLocale = operatorNameLocale?.given?.join(' ') || ''
  const operatorFamilyNameLocale = operatorNameLocale?.family || ''

  const regLasOfficeExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastOffice'
  )

  const office: fhir.Location = await getFromFhir(
    `/${regLasOfficeExtension?.valueReference?.reference}`
  )

  const operationHistory = {
    operationType: body.type,
    operatedOn: task?.lastModified,
    rejectReason: body.rejectReason,
    rejectComment: body.rejectComment,
    operatorRole: user.role,
    operatorFirstNames,
    operatorFamilyName,
    operatorFirstNamesLocale,
    operatorFamilyNameLocale,
    operatorOfficeName: office?.name || '',
    operatorOfficeAlias: office?.alias || []
  } as IOperationHistory

  if (
    isApplicationInStatus(body, IN_PROGRESS_STATUS) &&
    isNotification(body) &&
    body.eventLocationId
  ) {
    const facility: fhir.Location = await getFromFhir(
      `/Location/${body.eventLocationId}`
    )
    operationHistory.notificationFacilityName = facility?.name || ''
    operationHistory.notificationFacilityAlias = facility?.alias || []
  }

  if (isApplicationInStatus(body, REQUESTED_CORRECTION_STATUS)) {
    updateOperationHistoryWithCorrection(operationHistory, task)
  }
  body.operationHistories = body.operationHistories || []
  body.operationHistories.push(operationHistory)
}

function isApplicationInStatus(
  body: ICompositionBody,
  status: string
): boolean {
  return (body.type && body.type === status) || false
}

function isNotification(body: ICompositionBody): boolean {
  return (
    (body.compositionType &&
      NOTIFICATION_TYPES.includes(body.compositionType)) ||
    false
  )
}

function findDuplicateIds(
  compositionIdentifier: string,
  results: ApiResponse<ISearchResponse<any>> | null
) {
  const hits = (results && results.body.hits.hits) || []
  return hits
    .filter(
      (hit) =>
        hit._id !== compositionIdentifier && hit._score > MATCH_SCORE_THRESHOLD
    )
    .map((hit) => hit._id)
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
        motherDoB: body.motherDoB
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

function getPreviousStatus(body: IBirthCompositionBody) {
  if (body.operationHistories && body.operationHistories.length > 0) {
    return body.operationHistories[body.operationHistories.length - 1]
      .operationType
  }

  return null
}

export function isValidOperationHistory(body: IBirthCompositionBody) {
  const validStatusMapping = {
    [IN_PROGRESS_STATUS]: [null],
    [DECLARED_STATUS]: [null],
    [REJECTED_STATUS]: [DECLARED_STATUS, IN_PROGRESS_STATUS, VALIDATED_STATUS],
    [VALIDATED_STATUS]: [
      DECLARED_STATUS,
      IN_PROGRESS_STATUS,
      REJECTED_STATUS,
      null
    ],
    [WAITING_VALIDATION_STATUS]: [
      null,
      DECLARED_STATUS,
      IN_PROGRESS_STATUS,
      REJECTED_STATUS,
      VALIDATED_STATUS
    ],
    [REGISTERED_STATUS]: [
      null,
      DECLARED_STATUS,
      IN_PROGRESS_STATUS,
      REJECTED_STATUS,
      VALIDATED_STATUS,
      WAITING_VALIDATION_STATUS
    ],
    [CERTIFIED_STATUS]: [REGISTERED_STATUS, CERTIFIED_STATUS],
    [REQUESTED_CORRECTION_STATUS]: [REGISTERED_STATUS, CERTIFIED_STATUS]
  }

  const previousStatus = getPreviousStatus(body)
  const currentStatus = body.type

  if (
    currentStatus &&
    validStatusMapping[currentStatus] &&
    !validStatusMapping[currentStatus].includes(previousStatus)
  ) {
    return false
  }

  return true
}

function updateOperationHistoryWithCorrection(
  operationHistory: IOperationHistory,
  task?: fhir.Task
) {
  if (
    task?.input?.length &&
    task?.output?.length &&
    task.input.length === task.output.length
  ) {
    if (!operationHistory.correction) {
      operationHistory.correction = []
    }

    for (let i = 0; i < task.input.length; i += 1) {
      const section = task.input[i].valueCode || ''
      const fieldName = task.input[i].valueId || ''
      const oldValue = task.input[i].valueString || ''
      const newValue = task.output[i].valueString || ''

      operationHistory.correction?.push({
        section,
        fieldName,
        oldValue,
        newValue
      })
    }
  }
}
