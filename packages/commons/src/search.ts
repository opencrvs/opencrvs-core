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

export enum EVENT {
  BIRTH = 'birth',
  DEATH = 'death',
  MARRIAGE = 'marriage'
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
const DECLARATION_UPDATED_STATUS = 'DECLARATION_UPDATED'

export const validStatusMapping = {
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
    DECLARATION_UPDATED_STATUS,
    null
  ] as const,
  [WAITING_VALIDATION_STATUS]: [
    null,
    DECLARED_STATUS,
    IN_PROGRESS_STATUS,
    REJECTED_STATUS,
    VALIDATED_STATUS,
    DECLARATION_UPDATED_STATUS
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
  practitionerId: string
  firstName: string
  lastName: string
  officeName: string
}

export interface IOperationHistory {
  operationType: keyof typeof validStatusMapping
  operatedOn: string
}

export interface SearchDocument {
  compositionId: string
  compositionType?: string
  event?: EVENT
  name?: string
  lastStatusChangedAt?: string
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

/**
 * Takes up elastic search total and returns the number of documents independent of 'rest_total_hits_as_int' setting
 * https://github.com/elastic/elasticsearch-js/issues/1604
 * @param total total number of documents
 */
export const getSearchTotalCount = (
  total: number | { value: number } | undefined
) => {
  if (typeof total === 'number') {
    return total
  }
  return total?.value || 0
}
