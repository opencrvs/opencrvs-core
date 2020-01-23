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

import chalk from 'chalk'
import { updateRolesAndTypes } from '@resources/bgd/updates/services/update-roles'
import { updateUsersAndPractitioners } from '@resources/bgd/updates/services/update-users'

/**
 * Change logs on 2020-01-23:
 *
 * - Modified existing role API_USER to NOTIFICATION_API_USER
 * - Added new role VALIDATOR_API_USER
 * - Modified existing user 'api.user' info:
 *   - renamed username to 'api.dhis2'
 *   - updated role to 'NOTIFICATION_API_USER'
 *   - updated name to 'DHIS2 API`
 *   - updated scope to ['declare', 'notification-api']
 * - Added a new user 'api.org' with VALIDATOR_API_USER role
 *
 * Please add your change log here
 */
export default async function executeUpdates() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// DB update started ///////////////////////////'
    )}`
  )
  await updateRolesAndTypes()
  await updateUsersAndPractitioners()

  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// DB update finished ///////////////////////////'
    )}`
  )
  return 'yes'
}
executeUpdates()
