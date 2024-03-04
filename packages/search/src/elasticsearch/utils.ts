/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { MATCH_SCORE_THRESHOLD, USER_MANAGEMENT_URL } from '@search/constants'
import { searchByCompositionId } from '@search/elasticsearch/dbhelper'
import {
  findName,
  findNameLocale,
  findTaskExtension
} from '@search/features/fhir/fhir-utils'
import { client, ISearchResponse } from '@search/elasticsearch/client'

import fetch from 'node-fetch'
import {
  searchForBirthDuplicates,
  searchForDeathDuplicates
} from '@search/features/registration/deduplicate/service'
import {
  getFromBundleById,
  SavedBundle,
  SavedLocation,
  SavedTask
} from '@opencrvs/commons/types'

export const enum EVENT {
  BIRTH = 'Birth',
  DEATH = 'Death',
  MARRIAGE = 'Marriage'
}

export const IN_PROGRESS_STATUS = 'IN_PROGRESS'
export const ARCHIVED_STATUS = 'ARCHIVED'
export const DECLARED_STATUS = 'DECLARED'
export const REJECTED_STATUS = 'REJECTED'
export const VALIDATED_STATUS = 'VALIDATED'
const WAITING_VALIDATION_STATUS = 'WAITING_VALIDATION'
export const REGISTERED_STATUS = 'REGISTERED'
const REINSTATED_STATUS = 'REINSTATED'
export const CERTIFIED_STATUS = 'CERTIFIED'
export const ISSUED_STATUS = 'ISSUED'
const REQUESTED_CORRECTION_STATUS = 'REQUESTED_CORRECTION'

export const NOTIFICATION_TYPES = ['birth-notification', 'death-notification']
export const NAME_EN = 'en'

const validStatusMapping = {
  [ARCHIVED_STATUS]: [
    DECLARED_STATUS,
    REJECTED_STATUS,
    VALIDATED_STATUS
  ] as const,
  [IN_PROGRESS_STATUS]: [null] as const,
  [DECLARED_STATUS]: [ARCHIVED_STATUS, null] as const,
  [REJECTED_STATUS]: [
    DECLARED_STATUS,
    IN_PROGRESS_STATUS,
    WAITING_VALIDATION_STATUS,
    VALIDATED_STATUS,
    ARCHIVED_STATUS
  ] as const,
  [VALIDATED_STATUS]: [
    DECLARED_STATUS,
    IN_PROGRESS_STATUS,
    REJECTED_STATUS,
    ARCHIVED_STATUS,
    null
  ] as const,
  [WAITING_VALIDATION_STATUS]: [
    null,
    DECLARED_STATUS,
    IN_PROGRESS_STATUS,
    REJECTED_STATUS,
    VALIDATED_STATUS
  ] as const,
  [REGISTERED_STATUS]: [
    null,
    DECLARED_STATUS,
    IN_PROGRESS_STATUS,
    REJECTED_STATUS,
    VALIDATED_STATUS,
    WAITING_VALIDATION_STATUS
  ] as const,
  [CERTIFIED_STATUS]: [REGISTERED_STATUS, ISSUED_STATUS] as const,
  [ISSUED_STATUS]: [CERTIFIED_STATUS] as const,
  [REQUESTED_CORRECTION_STATUS]: [REGISTERED_STATUS, CERTIFIED_STATUS] as const,
  [REINSTATED_STATUS]: [ARCHIVED_STATUS] as const
}

export interface ICorrection {
  section: string
  fieldName: string
  oldValue: string
  newValue: string | number | boolean
}

export interface IAssignment {
  userId: string
  firstName: string
  lastName: string
  officeName: string
}

export interface IOperationHistory {
  operationType: keyof typeof validStatusMapping
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
  informantType?: string
  contactNumber?: string
  contactEmail?: string
  dateOfDeclaration?: string
  trackingId?: string
  registrationNumber?: string
  eventLocationId?: string
  eventJurisdictionIds?: string[]
  eventCountry?: string
  declarationLocationId?: string
  declarationJurisdictionIds?: string[]
  rejectReason?: string
  rejectComment?: string
  relatesTo?: string[]
  childFirstNames?: string
  childFamilyName?: string
  childFirstNamesLocal?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: string
  motherIdentifier?: string
  childDoB?: string
  childIdentifier?: string
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  modifiedAt?: string
  assignment?: IAssignment | null
  operationHistories?: IOperationHistory[]
}

export interface IBirthCompositionBody extends ICompositionBody {
  childFirstNames?: string
  childMiddleName?: string
  childFamilyName?: string
  childFirstNamesLocal?: string
  childMiddleNameLocal?: string
  childFamilyNameLocal?: string
  childDoB?: string
  childIdentifier?: string
  gender?: string
  motherFirstNames?: string
  motherMiddleName?: string
  motherFamilyName?: string
  motherFirstNamesLocal?: string
  motherMiddleNameLocal?: string
  motherFamilyNameLocal?: string
  motherDoB?: string
  motherIdentifier?: string
  fatherFirstNames?: string
  fatherMiddleName?: string
  fatherFamilyName?: string
  fatherFirstNamesLocal?: string
  fatherMiddleNameLocal?: string
  fatherFamilyNameLocal?: string
  fatherDoB?: string
  fatherIdentifier?: string
  informantFirstNames?: string
  informantMiddleName?: string
  informantFamilyName?: string
  informantFirstNamesLocal?: string
  informantMiddleNameLocal?: string
  informantFamilyNameLocal?: string
  informantDoB?: string
  informantIdentifier?: string
}

export interface IDeathCompositionBody extends ICompositionBody {
  deceasedFirstNames?: string
  deceasedMiddleName?: string
  deceasedFamilyName?: string
  deceasedFirstNamesLocal?: string
  deceasedMiddleNameLocal?: string
  deceasedFamilyNameLocal?: string
  deceasedDoB?: string
  gender?: string
  deceasedIdentifier?: string
  deathDate?: string
  motherFirstNames?: string
  motherMiddleName?: string
  motherFamilyName?: string
  motherFirstNamesLocal?: string
  motherMiddleNameLocal?: string
  motherFamilyNameLocal?: string
  fatherFirstNames?: string
  fatherMiddleName?: string
  fatherFamilyName?: string
  fatherFirstNamesLocal?: string
  fatherMiddleNameLocal?: string
  fatherFamilyNameLocal?: string
  spouseFirstNames?: string
  spouseMiddleName?: string
  spouseFamilyName?: string
  spouseFirstNamesLocal?: string
  spouseMiddleNameLocal?: string
  spouseFamilyNameLocal?: string
  informantFirstNames?: string
  informantMiddleName?: string
  informantFamilyName?: string
  informantFirstNamesLocal?: string
  informantMiddleNameLocal?: string
  informantFamilyNameLocal?: string
  informantDoB?: string
  informantIdentifier?: string
}

export interface IMarriageCompositionBody extends ICompositionBody {
  brideFirstNames?: string
  brideMiddleName?: string
  brideFamilyName?: string
  brideFirstNamesLocal?: string
  brideMiddleNameLocal?: string
  brideFamilyNameLocal?: string
  brideDoB?: string
  brideIdentifier?: string
  groomFirstNames?: string
  groomMiddleName?: string
  groomFamilyName?: string
  groomFirstNamesLocal?: string
  groomMiddleNameLocal?: string
  groomFamilyNameLocal?: string
  groomDoB?: string
  groomIdentifier?: string
  marriageDate?: string
  witnessOneFirstNames?: string
  witnessOneMiddleName?: string
  witnessOneFamilyName?: string
  witnessOneFirstNamesLocal?: string
  witnessOneMiddleNameLocal?: string
  witnessOneFamilyNameLocal?: string
  witnessTwoFirstNames?: string
  witnessTwoMiddleName?: string
  witnessTwoFamilyName?: string
  witnessTwoFirstNamesLocal?: string
  witnessTwoMiddleNameLocal?: string
  witnessTwoFamilyNameLocal?: string
}

type Label = {
  lang: string
  label: string
}

interface IUserRole {
  labels: Label[]
}

export interface IUserModelData {
  _id: string
  role: IUserRole
  name: fhir.HumanName[]
}

export async function detectBirthDuplicates(
  compositionId: string,
  body: IBirthCompositionBody
) {
  const searchResponse = await searchForBirthDuplicates(body, client)
  const duplicates = findDuplicateIds(searchResponse)
  return duplicates
}

export async function detectDeathDuplicates(
  compositionId: string,
  body: IDeathCompositionBody
) {
  const searchResponse = await searchForDeathDuplicates(body, client)
  const duplicates = findDuplicateIds(searchResponse)
  return duplicates
}

export async function getCreatedBy(compositionId: string) {
  const results = await searchByCompositionId(compositionId, client)
  const result = results?.body?.hits?.hits[0]?._source as ICompositionBody
  return result?.createdBy
}

export const getStatus = async (compositionId: string) => {
  const results = await searchByCompositionId(compositionId, client)
  const result = results?.body?.hits?.hits[0]?._source as ICompositionBody
  return result?.operationHistories as IOperationHistory[]
}

export const createStatusHistory = async (
  body: ICompositionBody,
  task: SavedTask,
  authHeader: string,
  bundle: SavedBundle
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

  let office: SavedLocation | undefined
  if (regLasOfficeExtension) {
    office = getFromBundleById<SavedLocation>(
      bundle,
      regLasOfficeExtension.valueReference.reference.split('/')[1]
    )?.resource
  }

  const operationHistory = {
    operationType: body.type,
    operatedOn: task?.lastModified,
    rejectReason: body.rejectReason,
    rejectComment: body.rejectComment,
    operatorRole:
      // user could be a system as well and systems don't have role
      user.role?.labels.find((label) => label.lang === 'en')?.label || '',
    operatorFirstNames,
    operatorFamilyName,
    operatorFirstNamesLocale,
    operatorFamilyNameLocale,
    operatorOfficeName: office?.name || '',
    operatorOfficeAlias: office?.alias || []
  } as IOperationHistory

  if (
    isDeclarationInStatus(body, IN_PROGRESS_STATUS) &&
    isNotification(body) &&
    body.eventLocationId
  ) {
    const facility = getFromBundleById<SavedLocation>(
      bundle,
      body.eventLocationId
    ).resource
    operationHistory.notificationFacilityName = facility?.name || ''
    operationHistory.notificationFacilityAlias = facility?.alias || []
  }

  if (isDeclarationInStatus(body, REQUESTED_CORRECTION_STATUS)) {
    updateOperationHistoryWithCorrection(operationHistory, task)
  }
  body.operationHistories = body.operationHistories || []
  body.operationHistories.push(operationHistory)
}

function isDeclarationInStatus(
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

export function findDuplicateIds(
  results: ISearchResponse<
    IBirthCompositionBody | IDeathCompositionBody
  >['hits']['hits']
) {
  return results
    .filter((hit) => hit._score > MATCH_SCORE_THRESHOLD)
    .map((hit) => ({
      id: hit._id,
      trackingId: hit._source.trackingId
    }))
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
  const previousStatus = getPreviousStatus(body)
  const currentStatus = body.type as keyof typeof validStatusMapping

  if (
    currentStatus &&
    validStatusMapping[currentStatus] &&
    !validStatusMapping[currentStatus].includes(previousStatus as never)
  ) {
    return false
  }

  return true
}

function updateOperationHistoryWithCorrection(
  operationHistory: IOperationHistory,
  task: SavedTask
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
      const oldValue =
        task.input[i].valueString ||
        task.output[i].valueInteger?.toString() ||
        ''
      const newValueString = task.output[i].valueString
      const newValueNumber = task.output[i].valueInteger

      const payload: ICorrection = {
        section,
        fieldName,
        oldValue,
        newValue: (newValueNumber !== undefined
          ? newValueNumber
          : newValueString)! // On of these the values always exist
      }

      operationHistory.correction?.push(payload)
    }
  }
}
