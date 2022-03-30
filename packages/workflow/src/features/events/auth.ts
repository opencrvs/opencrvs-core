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
import { Events } from '@workflow/features/events/handler'
import { USER_SCOPE } from '@workflow/utils/authUtils'

function getEventToScopeMap() {
  return {
    [Events.BIRTH_IN_PROGRESS_DEC]: [USER_SCOPE.DECLARE],
    [Events.BIRTH_NEW_DEC]: [USER_SCOPE.DECLARE, USER_SCOPE.REGISTER],
    [Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION]: [USER_SCOPE.VALIDATE],
    [Events.BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION]: [USER_SCOPE.REGISTER],
    [Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION]:
      [USER_SCOPE.REGISTER],
    [Events.BIRTH_MARK_REG]: [USER_SCOPE.REGISTER],
    [Events.BIRTH_MARK_VALID]: [USER_SCOPE.VALIDATE],
    [Events.BIRTH_MARK_CERT]: [USER_SCOPE.CERTIFY],
    [Events.BIRTH_MARK_VOID]: [
      USER_SCOPE.DECLARE,
      USER_SCOPE.VALIDATE,
      USER_SCOPE.REGISTER,
      USER_SCOPE.CERTIFY
    ],
    [Events.BIRTH_MARK_REINSTATED]: [USER_SCOPE.VALIDATE, USER_SCOPE.REGISTER],
    [Events.BIRTH_MARK_ARCHIVED]: [USER_SCOPE.VALIDATE, USER_SCOPE.REGISTER],
    [Events.DEATH_IN_PROGRESS_DEC]: [USER_SCOPE.DECLARE],
    [Events.DEATH_NEW_DEC]: [USER_SCOPE.DECLARE, USER_SCOPE.REGISTER],
    [Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION]: [USER_SCOPE.VALIDATE],
    [Events.DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION]: [USER_SCOPE.REGISTER],
    [Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION]:
      [USER_SCOPE.REGISTER],
    [Events.DEATH_MARK_REG]: [USER_SCOPE.REGISTER],
    [Events.DEATH_MARK_VALID]: [USER_SCOPE.VALIDATE],
    [Events.DEATH_MARK_CERT]: [USER_SCOPE.CERTIFY],
    [Events.DEATH_MARK_VOID]: [
      USER_SCOPE.DECLARE,
      USER_SCOPE.VALIDATE,
      USER_SCOPE.REGISTER,
      USER_SCOPE.CERTIFY
    ],
    [Events.DEATH_MARK_REINSTATED]: [USER_SCOPE.VALIDATE, USER_SCOPE.REGISTER],
    [Events.DEATH_MARK_ARCHIVED]: [USER_SCOPE.VALIDATE, USER_SCOPE.REGISTER],
    [Events.EVENT_NOT_DUPLICATE]: [
      USER_SCOPE.DECLARE,
      USER_SCOPE.VALIDATE,
      USER_SCOPE.REGISTER,
      USER_SCOPE.CERTIFY
    ],
    [Events.DOWNLOADED]: [
      USER_SCOPE.DECLARE,
      USER_SCOPE.VALIDATE,
      USER_SCOPE.CERTIFY
    ],
    [Events.BIRTH_REQUEST_CORRECTION]: [
      USER_SCOPE.REGISTER,
      USER_SCOPE.CERTIFY
    ],
    [Events.DEATH_REQUEST_CORRECTION]: [USER_SCOPE.REGISTER, USER_SCOPE.CERTIFY]
  }
}

export function isUserAuthorized(
  scopes: string[] | undefined,
  event: Events
): boolean {
  if (!scopes) {
    return false
  }
  const eventToScopeMap = getEventToScopeMap()

  return scopes.some(
    (scope) =>
      eventToScopeMap[event] &&
      (eventToScopeMap[event] as string[]).includes(scope)
  )
}
