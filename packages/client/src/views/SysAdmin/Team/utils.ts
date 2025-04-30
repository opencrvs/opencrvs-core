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
import { messages } from '@client/i18n/messages/views/userSetup'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { MessageDescriptor } from 'react-intl'

export enum UserStatus {
  ACTIVE,
  DEACTIVATED,
  PENDING,
  DISABLED
}

const AuditDescriptionMapping: {
  [key: string]: MessageDescriptor
} = {
  IN_PROGRESS: messages.inProgressAuditAction,
  DECLARED: messages.declaredAuditAction,
  VALIDATED: messages.validatedAuditAction,
  DECLARATION_UPDATED: messages.updatedAuditAction,
  REGISTERED: messages.registeredAuditAction,
  REJECTED: messages.rejectedAuditAction,
  CERTIFIED: messages.certifiedAuditAction,
  ISSUED: messages.issuedAuditAction,
  ASSIGNED: messages.assignedAuditAction,
  UNASSIGNED: messages.unAssignedAuditAction,
  CORRECTED: messages.correctedAuditAction,
  REQUESTED_CORRECTION: messages.requestedCorrectionAuditAction,
  APPROVED_CORRECTION: messages.approvedCorrectionAuditAction,
  REJECTED_CORRECTION: messages.rejectedCorrectedAuditAction,
  ARCHIVED: messages.archivedAuditAction,
  LOGGED_IN: messages.loggedInAuditAction,
  LOGGED_OUT: messages.loggedOutAuditAction,
  PHONE_NUMBER_CHANGED: messages.phoneNumberChangedAuditAction,
  EMAIL_ADDRESS_CHANGED: messages.emailAddressChangedAuditAction,
  PASSWORD_CHANGED: messages.passwordChangedAuditAction,
  DEACTIVATE: messages.deactivateAuditAction,
  REACTIVATE: messages.reactivateAuditAction,
  EDIT_USER: messages.editUserAuditAction,
  CREATE_USER: messages.createUserAuditAction,
  PASSWORD_RESET: messages.passwordResetAuditAction,
  USERNAME_REMINDER: messages.userNameReminderAuditAction,
  USERNAME_REMINDER_BY_ADMIN: messages.usernameReminderByAdmin,
  PASSWORD_RESET_BY_ADMIN: messages.passwordResetByAdmin,
  RETRIEVED: messages.retrievedAuditAction,
  VIEWED: messages.viewedAuditAction,
  REINSTATED_IN_PROGRESS: messages.reInstatedInProgressAuditAction,
  REINSTATED_DECLARED: messages.reInstatedInReviewAuditAction,
  REINSTATED_REJECTED: messages.reInStatedRejectedAuditAction,
  SENT_FOR_APPROVAL: messages.sentForApprovalAuditAction,
  MARKED_AS_DUPLICATE: messages.markedAsDuplicate,
  MARKED_AS_NOT_DUPLICATE: messages.markedAsNotDuplicate
}

export const getAddressName = (
  offlineCountryConfig: IOfflineData,
  { name, partOf }: ILocation
): string => {
  const parentLocationId = partOf.split('/')[1]
  if (parentLocationId === '0') return name
  const parentLocation = offlineCountryConfig?.locations[parentLocationId]
  return `${name}, ${getAddressName(offlineCountryConfig, parentLocation)}`
}

export function getUserAuditDescription(
  status: string
): MessageDescriptor | undefined {
  return AuditDescriptionMapping[status] || undefined
}

export function checkExternalValidationStatus(status?: string | null): boolean {
  return !(
    !window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE &&
    status === 'WAITING_VALIDATION'
  )
}
