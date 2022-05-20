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
/* eslint-disable */
import { registerForms } from '@client/forms/configuration/default'
import * as fs from 'fs'
import { createUserForm } from './forms/user/fieldDefinitions/createUser'

async function generateForm() {
  const defaultFormsConfig = {
    registerForm: registerForms,
    userForm: createUserForm
  }
  fs.writeFileSync(
    `${process.argv[2]}/src/tests/default.json`,
    JSON.stringify(defaultFormsConfig, null, 2)
  )
  return true
}

generateForm()
