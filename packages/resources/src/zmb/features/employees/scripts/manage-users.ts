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
import { MONGO_URL } from '@resources/constants'
import * as mongoose from 'mongoose'
import Role from '@opencrvs/user-mgnt/src/model/role'
import User, { IUserModel } from '@opencrvs/user-mgnt/src/model/user'

function setDemoUser(scopes: string[], environment: string): string[] {
  if (environment === 'development') {
    // This makes sure that for test users in development, the SMS code is always 000000
    scopes.push('demo')
  }
  return scopes
}

export function getScope(role: string, environment: string): string[] {
  switch (role) {
    case 'FIELD_AGENT':
      return setDemoUser(['declare'], environment)
    case 'REGISTRATION_AGENT':
      return setDemoUser(['validate', 'certify'], environment)
    case 'LOCAL_REGISTRAR':
      return setDemoUser(['register', 'performance', 'certify'], environment)
    case 'DISTRICT_REGISTRAR':
      return setDemoUser(['register', 'performance', 'certify'], environment)
    case 'STATE_REGISTRAR':
      return setDemoUser(['register', 'performance', 'certify'], environment)
    case 'NATIONAL_REGISTRAR':
      return setDemoUser(
        ['register', 'performance', 'certify', 'config', 'teams'],
        environment
      )
    case 'LOCAL_SYSTEM_ADMIN':
      return setDemoUser(['sysadmin'], environment)
    case 'API_USER':
      return setDemoUser(['declare', 'api'], environment)
    default:
      return setDemoUser(['declare'], environment)
  }
}

export function createUsers(users: IUserModel[]) {
  mongoose.connect(MONGO_URL)
  const fieldAgentRole = new Role({
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    types: ['HOSPITAL', 'CHA'],
    active: true
  })

  const regitstrationAgentRole = new Role({
    title: 'Registration Agent',
    value: 'REGISTRATION_AGENT',
    types: ['ENTREPENEUR', 'DATA_ENTRY_CLERK'],
    active: true
  })

  const regitstrarRole = new Role({
    title: 'Registrar',
    value: 'LOCAL_REGISTRAR',
    types: ['SECRETARY', 'CHAIRMAN', 'MAYOR'],
    active: true
  })

  const sysAdminLocalRole = new Role({
    title: 'System admin (local)',
    value: 'LOCAL_SYSTEM_ADMIN',
    types: ['LOCAL_SYSTEM_ADMIN'],
    active: true
  })

  const sysAdminNationalRole = new Role({
    title: 'System admin (national)',
    value: 'NATIONAL_SYSTEM_ADMIN',
    types: ['NATIONAL_SYSTEM_ADMIN'],
    active: true
  })

  const performanceOversightRole = new Role({
    title: 'Performance Oversight',
    value: 'PERFORMANCE_OVERSIGHT',
    types: ['DNRPC'],
    active: true
  })

  const performanceMgntRole = new Role({
    title: 'Performance Management',
    value: 'PERFORMANCE_MANAGEMENT',
    types: ['DNRPC'],
    active: true
  })

  const roles = [
    fieldAgentRole,
    regitstrationAgentRole,
    regitstrarRole,
    sysAdminLocalRole,
    sysAdminNationalRole,
    performanceOversightRole,
    performanceMgntRole
  ]
  function onInsert(err: any, values: any) {
    if (!err) {
      mongoose.disconnect()
    } else {
      throw Error(
        `Cannot save ${JSON.stringify(values)} to user-mgnt db ... ${err}`
      )
    }
  }
  Role.collection.insertMany(roles, onInsert)
  User.collection.insertMany(users, onInsert)
}
