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

import { LANG_EN } from '@client/utils/constants'
import { IRoles } from './UserRoles'

export function getUserRole(lang: string, roles: IRoles) {
  return roles.map((role) => {
    const defaultLabel = role.labels?.find((label) => label.lang === LANG_EN)
    const label = role.labels?.find((label) => label.lang === lang)
    return label?.label || defaultLabel?.label
  })
}
