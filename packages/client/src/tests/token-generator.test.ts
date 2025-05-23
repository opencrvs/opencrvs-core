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

import { testDataGenerator } from './test-data-generators'
import { generateToken } from './util'

it.skip('Generates tokens', () => {
  const generator = testDataGenerator()
  const token = {
    fieldAgent: generateToken(
      generator.user.scopes.fieldAgent,
      generator.user.id.fieldAgent
    ),
    registrationAgent: generateToken(
      generator.user.scopes.registrationAgent,
      generator.user.id.registrationAgent
    ),
    localRegistrar: generateToken(
      generator.user.scopes.localRegistrar,
      generator.user.id.localRegistrar
    )
  }
  // eslint-disable-next-line no-console
  console.log({ token })
})
