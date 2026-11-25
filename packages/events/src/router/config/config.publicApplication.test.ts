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
import { createUnauthenticatedTestClient } from '@events/tests/utils'

describe('config.publicApplication', () => {
  test('gives anyone the fields the login page needs, and no others', async () => {
    const client = await createUnauthenticatedTestClient()

    const config = await client.config.publicApplication()

    expect(Object.keys(config).sort()).toEqual([
      'APPLICATION_NAME',
      'COUNTRY_LOGO',
      'INFORMANT_NOTIFICATION_DELIVERY_METHOD',
      'PHONE_NUMBER_PATTERN',
      'USER_NOTIFICATION_DELIVERY_METHOD'
    ])
  })
})
