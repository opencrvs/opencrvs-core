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
import { Events } from '@workflow/features/events/utils'
import { USER_SCOPE } from '@workflow/utils/authUtils'

function getEventToScopeMap(event: Events) {
  switch (event) {
    case Events.BIRTH_IN_PROGRESS_DEC:
    case Events.DEATH_IN_PROGRESS_DEC:
    case Events.MARRIAGE_IN_PROGRESS_DEC:
      return [USER_SCOPE.DECLARE]

    case Events.BIRTH_NEW_DEC:
    case Events.DEATH_NEW_DEC:
    case Events.MARRIAGE_NEW_DEC:
      return [USER_SCOPE.DECLARE, USER_SCOPE.REGISTER, USER_SCOPE.VALIDATE]

    case Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION:
    case Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION:
    case Events.MARRIAGE_REQUEST_FOR_REGISTRAR_VALIDATION:
      return [USER_SCOPE.VALIDATE]

    case Events.BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.MARRIAGE_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      return [USER_SCOPE.REGISTER]

    case Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.REGISTRAR_MARRIAGE_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      return [USER_SCOPE.REGISTER]

    case Events.BIRTH_MARK_REG:
    case Events.DEATH_MARK_REG:
    case Events.MARRIAGE_MARK_REG:
      return [USER_SCOPE.REGISTER]

    case Events.BIRTH_MARK_VALID:
    case Events.DEATH_MARK_VALID:
    case Events.MARRIAGE_MARK_VALID:
      return [USER_SCOPE.VALIDATE]

    case Events.BIRTH_MARK_CERT:
    case Events.DEATH_MARK_CERT:
    case Events.MARRIAGE_MARK_CERT:
      return [USER_SCOPE.CERTIFY]

    case Events.BIRTH_MARK_VOID:
    case Events.DEATH_MARK_VOID:
    case Events.MARRIAGE_MARK_VOID:
    case Events.EVENT_NOT_DUPLICATE:
      return [
        USER_SCOPE.DECLARE,
        USER_SCOPE.VALIDATE,
        USER_SCOPE.REGISTER,
        USER_SCOPE.CERTIFY
      ]

    case Events.BIRTH_MARK_REINSTATED:
    case Events.DEATH_MARK_REINSTATED:
    case Events.MARRIAGE_MARK_REINSTATED:
    case Events.BIRTH_MARK_ARCHIVED:
    case Events.DEATH_MARK_ARCHIVED:
    case Events.MARRIAGE_MARK_ARCHIVED:
      return [USER_SCOPE.VALIDATE, USER_SCOPE.REGISTER]

    case Events.BIRTH_MAKE_CORRECTION:
    case Events.DEATH_MAKE_CORRECTION:
    case Events.MARRIAGE_MAKE_CORRECTION:
      return [USER_SCOPE.REGISTER, USER_SCOPE.CERTIFY]
    case Events.BIRTH_MARK_ISSUE:
    case Events.DEATH_MARK_ISSUE:
    case Events.MARRIAGE_MARK_ISSUE:
      return [USER_SCOPE.CERTIFY]
    case Events.DOWNLOADED:
      return [
        USER_SCOPE.DECLARE,
        USER_SCOPE.VALIDATE,
        USER_SCOPE.RECORD_SEARCH,
        USER_SCOPE.CERTIFY
      ]

    case Events.VIEWED:
      return [USER_SCOPE.VALIDATE, USER_SCOPE.REGISTER, USER_SCOPE.CERTIFY]

    case Events.ASSIGNED_EVENT:
    case Events.UNASSIGNED_EVENT:
      return [USER_SCOPE.VALIDATE, USER_SCOPE.REGISTER]
    case Events.VERIFIED_EVENT:
      return [USER_SCOPE.VERIFY]
    case Events.MARKED_AS_DUPLICATE:
      return [USER_SCOPE.REGISTER, USER_SCOPE.CERTIFY, USER_SCOPE.VALIDATE]

    default:
      return []
  }
}

export function isUserAuthorized(
  scopes: string[] | undefined,
  event: Events
): boolean {
  if (!scopes) {
    return false
  }

  return scopes.some((scope) =>
    (getEventToScopeMap(event) as string[]).includes(scope)
  )
}
