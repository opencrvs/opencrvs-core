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

import { push, goBack as back } from 'connected-react-router'
import { HOME } from '@performance/navigation/routes'
import { getToken } from '@performance/utils/authUtils'

export function goBack() {
  return back()
}

export function goToHome() {
  return push(HOME)
}

export function goToRegister() {
  window.location.assign(`${window.config.REGISTER_URL}?token=${getToken()}`)
}
