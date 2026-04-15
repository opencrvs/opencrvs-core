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
import {
  Action as DeclarationAction,
  IFormData,
  IFormFieldValue
} from '@client/forms'
import { storage } from '@client/storage'
import { AssignmentData, EventType, RegStatus } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { v4 as uuid } from 'uuid'

const SET_INITIAL_DECLARATION = 'DECLARATION/SET_INITIAL_DECLARATION'
const STORE_DECLARATION = 'DECLARATION/STORE_DECLARATION'

enum SUBMISSION_STATUS {
  DRAFT = 'DRAFT',
  READY_TO_SUBMIT = 'READY_TO_SUBMIT',
  SUBMITTING = 'SUBMITTING',
  VALIDATED = 'VALIDATED',
  DECLARED = 'DECLARED',
  SUBMITTED = 'SUBMITTED',
  READY_TO_APPROVE = 'READY_TO_APPROVE',
  APPROVING = 'APPROVING',
  APPROVED = 'APPROVED',
  READY_TO_REGISTER = 'READY_TO_REGISTER',
  REGISTERING = 'REGISTERING',
  REGISTERED = 'REGISTERED',
  READY_TO_REJECT = 'READY_TO_REJECT',
  REJECTING = 'REJECTING',
  REJECTED = 'REJECTED',
  READY_TO_ARCHIVE = 'READY_TO_ARCHIVE',
  ARCHIVING = 'ARCHIVING',
  ARCHIVED = 'ARCHIVED',
  READY_TO_CERTIFY = 'READY_TO_CERTIFY',
  REINSTATING = 'REINSTATING',
  REINSTATED = 'REINSTATED',
  READY_TO_REINSTATE = 'READY_TO_REINSTATE',
  CERTIFYING = 'CERTIFYING',
  CERTIFIED = 'CERTIFIED',
  READY_TO_ISSUE = 'READY_TO_ISSUE',
  ISSUING = 'ISSUING',
  ISSUED = 'ISSUED',
  READY_TO_REQUEST_CORRECTION = 'READY_TO_REQUEST_CORRECTION',
  REQUESTING_CORRECTION = 'REQUESTING_CORRECTION',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK',
  IN_PROGRESS = 'IN_PROGRESS',
  CORRECTION_REQUESTED = 'CORRECTION_REQUESTED',
  REJECT_CORRECTION = 'REJECT_CORRECTION'
}

enum DOWNLOAD_STATUS {
  READY_TO_DOWNLOAD = 'READY_TO_DOWNLOAD',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOADED = 'DOWNLOADED',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK',
  READY_TO_UNASSIGN = 'READY_TO_UNASSIGN',
  UNASSIGNING = 'UNASSIGNING'
}

export interface IPayload {
  [key: string]: IFormFieldValue
}

interface IVisitedGroupId {
  sectionId: string
  groupId: string
}

interface ITaskHistory {
  operationType?: string
  operatedOn?: string
}

export interface IDuplicates {
  compositionId: string
  trackingId: string
}

export interface IDeclaration {
  id: string
  data: IFormData
  duplicates?: IDuplicates[]
  originalData?: IFormData
  localData?: IFormData
  savedOn?: number
  createdAt?: string
  modifiedOn?: number
  eventType?: string
  review?: boolean
  event: EventType
  registrationStatus?: RegStatus
  submissionStatus?: string
  downloadStatus?: DOWNLOAD_STATUS
  downloadRetryAttempt?: number
  action?: DeclarationAction
  trackingId?: string
  registrationNumber?: string
  payload?: IPayload
  visitedGroupIds?: IVisitedGroupId[]
  timeLoggedMS?: number
  writingDraft?: boolean
  operationHistories?: ITaskHistory[]
  isNotDuplicate?: boolean
  assignmentStatus?: AssignmentData
}

type Relation =
  | 'FATHER'
  | 'MOTHER'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'EXTENDED_FAMILY'
  | 'OTHER'
  | 'INFORMANT'
  | 'PRINT_IN_ADVANCE'

type RelationForCertificateCorrection =
  | 'FATHER'
  | 'MOTHER'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'EXTENDED_FAMILY'
  | 'OTHER'
  | 'INFORMANT'
  | 'PRINT_IN_ADVANCE'
  | 'CHILD'

export type ICertificate = {
  collector?: Partial<{
    type: Relation | string
    certificateTemplateId: string
  }>
  corrector?: Partial<{ type: RelationForCertificateCorrection | string }>
  hasShowedVerifiedDocument?: boolean
  payments?: Payment
  certificateTemplateId?: string
}

type PaymentType = 'MANUAL'

type PaymentOutcomeType = 'COMPLETED' | 'ERROR' | 'PARTIAL'

type Payment = {
  paymentId?: string
  type: PaymentType
  amount: number
  outcome: PaymentOutcomeType
  date: string
}

interface IStoreDeclarationAction {
  type: typeof STORE_DECLARATION
  payload: { declaration: IDeclaration }
}

export interface IUserData {
  userID: string
  userPIN?: string
  declarations: IDeclaration[]
}

export function createDeclaration(event: EventType, initialData?: IFormData) {
  return {
    id: uuid(),
    data: initialData || {},
    event,
    submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
  }
}

export function dynamicDispatch(
  action: string,
  payload: { [key: string]: string }
) {
  return {
    type: action,
    payload
  }
}

export function storeDeclaration(
  declaration: IDeclaration
): IStoreDeclarationAction {
  declaration.savedOn = Date.now()
  return { type: STORE_DECLARATION, payload: { declaration } }
}

export function setInitialDeclarations() {
  return { type: SET_INITIAL_DECLARATION }
}

export async function getCurrentUserID(): Promise<string> {
  const userDetails = await storage.getItem('USER_DETAILS')

  if (!userDetails) {
    return ''
  }
  return (JSON.parse(userDetails) as UserDetails).id || ''
}
