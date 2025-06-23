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

import { getStatusFromActions } from '.'
import { Action, ActionStatus } from '../ActionDocument'
import { ActionType, isMetaAction } from '../ActionType'
import { CustomFlags, EventStatus, Flag } from '../EventMetadata'

function isCertificatePrinted(actions: Action[]) {
  return actions.reduce<boolean>((prev, { type }) => {
    if (type === ActionType.PRINT_CERTIFICATE) {
      return true
    }
    if (type === ActionType.APPROVE_CORRECTION) {
      return false
    }
    return prev
  }, false)
}

function isCorrectionRequested(actions: Action[]) {
  return actions.reduce<boolean>((prev, { type }) => {
    if (type === ActionType.REQUEST_CORRECTION) {
      return true
    }
    if (type === ActionType.APPROVE_CORRECTION) {
      return false
    }
    if (type === ActionType.REJECT_CORRECTION) {
      return false
    }
    return prev
  }, false)
}

function isDeclarationIncomplete(actions: Action[]): boolean {
  return getStatusFromActions(actions) === EventStatus.enum.NOTIFIED
}

function doesRequireUpdates(actions: Action[]): boolean {
  return getStatusFromActions(actions) === EventStatus.enum.REJECTED
}

function isPendingExternalValidation(flags: Flag[]): boolean {
  return flags.includes(`${ActionType.REGISTER}:${ActionStatus.Requested}`)
}

function isRegistrationCertifyNewRegistration(actions: Action[]): boolean {
  if (
    isCertificatePrinted(actions) ||
    getStatusFromActions(actions) !== EventStatus.enum.REGISTERED
  ) {
    return false
  }
  if (actions.some(({ type }) => type === ActionType.PRINT_CERTIFICATE)) {
    return false
  }

  return true
}

function isRegistrationReCertifyAfterCorrection(actions: Action[]): boolean {
  if (
    isCertificatePrinted(actions) ||
    getStatusFromActions(actions) !== EventStatus.enum.REGISTERED
  ) {
    return false
  }
  if (!actions.some(({ type }) => type === ActionType.PRINT_CERTIFICATE)) {
    return false
  }
  return true
}

export function getFlagsFromActions(actions: Action[]): Flag[] {
  const sortedactions = actions
    .filter(({ type }) => !isMetaAction(type))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const actionStatus = sortedactions.reduce(
    (actionStatuses, { type, status }) => ({
      ...actionStatuses,
      [type]: status
    }),
    {} as Record<ActionType, ActionStatus>
  )

  const flags = Object.entries(actionStatus)
    .filter(([, status]) => status !== ActionStatus.Accepted)
    .map(([type, status]) => {
      const flag = `${type.toLowerCase()}:${status.toLowerCase()}`
      return flag satisfies Flag
    })

  if (isCertificatePrinted(sortedactions)) {
    flags.push(CustomFlags.CERTIFICATE_PRINTED)
  }
  if (isCorrectionRequested(sortedactions)) {
    flags.push(CustomFlags.REGISTRATION_CORRECTION_REQUESTED)
  }
  if (isDeclarationIncomplete(sortedactions)) {
    flags.push(CustomFlags.DECLARATION_INCOMPLETE)
  }
  if (doesRequireUpdates(sortedactions)) {
    flags.push(CustomFlags.DECLARATION_REQUIRES_UPDATES)
  }
  if (isPendingExternalValidation(flags)) {
    flags.push(CustomFlags.DECLARATION_PENDING_EXTERNAL_VALIDATION)
  }
  if (isRegistrationCertifyNewRegistration(sortedactions)) {
    flags.push(CustomFlags.REGISTRATION_CERTIFY_NEW_REGISTRATION)
  }
  if (isRegistrationReCertifyAfterCorrection(sortedactions)) {
    flags.push(CustomFlags.REGISTRATION_RE_CERTIFY_AFTER_CORRECTION)
  }

  return flags
}
