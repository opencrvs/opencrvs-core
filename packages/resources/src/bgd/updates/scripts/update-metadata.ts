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
