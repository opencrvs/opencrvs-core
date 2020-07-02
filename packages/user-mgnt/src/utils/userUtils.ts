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
import * as Hapi from 'hapi'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

interface IRoleScopeMapping {
  [key: string]: string[]
}

export const roleScopeMapping: IRoleScopeMapping = {
  FIELD_AGENT: ['declare'],
  REGISTRATION_AGENT: ['validate'],
  LOCAL_REGISTRAR: ['register', 'performance', 'certify'],
  LOCAL_SYSTEM_ADMIN: ['sysadmin'],
  NATIONAL_SYSTEM_ADMIN: ['sysadmin'],
  PERFORMANCE_OVERSIGHT: ['performance'],
  PERFORMANCE_MANAGEMENT: ['performance'],
  NOTIFICATION_API_USER: ['declare', 'notification-api'],
  VALIDATOR_API_USER: ['validator-api'],
  CHATBOT_API_USER: ['declare', 'chatbot-api']
}

export const hasScope = (request: Hapi.Request, scope: string): boolean => {
  if (
    !request.auth ||
    !request.auth.credentials ||
    !request.auth.credentials.scope
  ) {
    return false
  }
  return request.auth.credentials.scope.includes(scope)
}

export function hasDemoScope(request: Hapi.Request): boolean {
  return hasScope(request, 'demo')
}
