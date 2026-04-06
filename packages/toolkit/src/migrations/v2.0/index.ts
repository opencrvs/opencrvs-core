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

import { main as removeReviewFromRegisterAction } from './remove-review-from-register-action'
import { main as makeBuiltInValidateActionsCustom } from './make-built-in-validate-actions-custom'
import { main as removeDeleteActions } from './remove-delete-actions'

console.log('Upgrading from v1.9 to v2.0')

async function run() {
  await removeReviewFromRegisterAction()
  await makeBuiltInValidateActionsCustom()
  await removeDeleteActions()
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
