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
import { AdministrativeArea, UUID } from '@opencrvs/commons/client'
import { getAdministrativeAreaHierarchy } from '../../../v2-events/utils'

export enum UserStatus {
  ACTIVE,
  DEACTIVATED,
  PENDING,
  DISABLED
}

const AuditDescriptionMapping: Record<string, MessageDescriptor> = {
  // User management operations
  'user.logged_in': messages.loggedInAuditAction,
  'user.logged_out': messages.loggedOutAuditAction,
  'user.create_user': messages.createUserAuditAction,
  'user.edit_user': messages.editUserAuditAction,
  'user.password_changed': messages.passwordChangedAuditAction,
  'user.password_reset': messages.passwordResetAuditAction,
  'user.password_reset_by_admin': messages.passwordResetByAdmin,
  'user.phone_number_changed': messages.phoneNumberChangedAuditAction,
  'user.email_address_changed': messages.emailAddressChangedAuditAction,
  'user.username_reminder': messages.userNameReminderAuditAction,
  'user.username_reminder_by_admin': messages.usernameReminderByAdmin,
  'user.deactivate': messages.deactivateAuditAction,
  'user.reactivate': messages.reactivateAuditAction,
  // Event action operations
  'event.create': messages.createdAuditAction,
  'event.get': messages.downloadAuditAction,
  'event.search': messages.searchAuditAction,
  'event.actions.notify.request': messages.inProgressAuditAction,
  'event.actions.declare.request': messages.declaredAuditAction,
  'event.actions.register.request': messages.registeredAuditAction,
  'event.actions.reject.request': messages.rejectedAuditAction,
  'event.actions.validate.request': messages.validatedAuditAction,
  'event.actions.edit.request': messages.updatedAuditAction,
  'event.actions.assign.request': messages.assignedAuditAction,
  'event.actions.unassign.request': messages.unAssignedAuditAction,
  'event.actions.read.request': messages.viewedAuditAction,
  'event.actions.archive.request': messages.archivedAuditAction,
  'event.actions.reinstate.request': messages.reInstatedInProgressAuditAction,
  'event.actions.print_certificate.request': messages.certifiedAuditAction,
  'event.actions.correction.request.request':
    messages.requestedCorrectionAuditAction,
  'event.actions.correction.approve.request':
    messages.approvedCorrectionAuditAction,
  'event.actions.correction.reject.request':
    messages.rejectedCorrectedAuditAction,
  'event.actions.mark_as_duplicate.request': messages.markedAsDuplicate,
  'event.actions.mark_as_not_duplicate.request': messages.markedAsNotDuplicate
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

export const getAddressNameV2 = (
  administrativeAreas: Map<UUID, AdministrativeArea>,
  administrativeArea?: AdministrativeArea
): string => {
  if (!administrativeArea) {
    return ''
  }
  const { name, parentId } = administrativeArea

  if (!parentId) {
    return name
  }

  const hierarchy = getAdministrativeAreaHierarchy(
    administrativeArea.id,
    administrativeAreas
  )

  return hierarchy.map((area) => area.name).join(', ')
}

export function getUserAuditDescription(
  status: string
): MessageDescriptor | undefined {
  return AuditDescriptionMapping[status] || undefined
}
