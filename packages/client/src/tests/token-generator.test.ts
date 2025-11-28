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

import { TestUserRole, TokenUserType } from '@opencrvs/commons/client'
import { testDataGenerator } from './test-data-generators'
import { generateToken } from './util'

it('Generates tokens', () => {
  const generator = testDataGenerator()
  const token = {
    fieldAgent: generateToken({
      scope: generator.user.scopes.fieldAgent,
      subject: generator.user.id.fieldAgent,
      userType: TokenUserType.enum.user,
      role: TestUserRole.enum.FIELD_AGENT
    }),
    registrationAgent: generateToken({
      scope: generator.user.scopes.registrationAgent,
      subject: generator.user.id.registrationAgent,
      userType: TokenUserType.enum.user,
      role: TestUserRole.enum.REGISTRATION_AGENT
    }),
    localRegistrar: generateToken({
      scope: generator.user.scopes.localRegistrar,
      subject: generator.user.id.localRegistrar,
      userType: TokenUserType.enum.user,
      role: TestUserRole.enum.LOCAL_REGISTRAR
    }),
    localSystemAdmin: generateToken({
      scope: generator.user.scopes.localSystemAdmin,
      subject: generator.user.id.localSystemAdmin,
      userType: TokenUserType.enum.user,
      role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN
    }),
    nationalSystemAdmin: generateToken({
      scope: generator.user.scopes.nationalSystemAdmin,
      subject: generator.user.id.nationalSystemAdmin,
      userType: TokenUserType.enum.user,
      role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN
    })
  }
  expect(token.fieldAgent).toMatchSnapshot('fieldAgent token')
  expect(token.registrationAgent).toMatchSnapshot('registrationAgent token')
  expect(token.localRegistrar).toMatchSnapshot('localRegistrar token')
  expect(token.localSystemAdmin).toMatchSnapshot('localSystemAdmin token')
  expect(token.nationalSystemAdmin).toMatchSnapshot('nationalSystemAdmin token')
})
