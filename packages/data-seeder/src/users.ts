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
import fetch from 'node-fetch'
import {
  COUNTRY_CONFIG_URL,
  HEARTH_URL,
  USER_MANAGEMENT_URL
} from './constants'
import { z } from 'zod'
import { raise } from './utils'

const UserSchema = z.array(
  z.object({
    primaryOfficeId: z.string(),
    givenNames: z.string(),
    familyName: z.string(),
    systemRole: z.enum([
      'FIELD_AGENT',
      'REGISTRATION_AGENT',
      'LOCAL_REGISTRAR',
      'LOCAL_SYSTEM_ADMIN',
      'NATIONAL_SYSTEM_ADMIN',
      'PERFORMANCE_MANAGEMENT',
      'NATIONAL_REGISTRAR'
    ]),
    role: z.enum([
      'Field Agent',
      'Police Officer',
      'Social Worker',
      'Healthcare Worker',
      'Registration Agent',
      'Local Registrar',
      'Local System Admin',
      'National System Admin',
      'Performance Manager',
      'National Registrar'
    ]),
    mobile: z.string(),
    email: z.string().email(),
    password: z.string()
  })
)

async function getUseres() {
  const url = new URL('users', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the users from ${url}`)
  }
  const parsedUsers = UserSchema.safeParse(await res.json())
  if (!parsedUsers.success) {
    raise(parsedUsers.error.issues.toString())
  }
  return parsedUsers.data
}

export async function seedUsers(
  token: string,
  roleIdMap: Record<string, string>
) {
  const rawUsers = await getUseres()
  let createdUsers = 0,
    failed = 0
  await Promise.all(
    rawUsers.map(async (rawUser) => {
      const { givenNames, familyName, role, primaryOfficeId, ...user } = rawUser
      const response = await fetch(
        `${HEARTH_URL}/Location?identifier=${primaryOfficeId}`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )
      const locationBundle: fhir3.Bundle<fhir3.Location> = await response.json()
      const officeId = locationBundle.entry?.[0].id
      if (!officeId) {
        console.log(`No office found with id ${primaryOfficeId}`)
        return
      }
      if (!roleIdMap[role]) {
        console.log(`Role "${role}" is not recognized by system`)
        return
      }
      const parsedUser = {
        ...user,
        role: roleIdMap[role],
        name: [
          {
            use: 'en',
            family: familyName,
            given: [givenNames]
          }
        ],
        primaryOfficeId: officeId
      }
      const url = new URL('createUser', USER_MANAGEMENT_URL).toString()
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(parsedUser),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      })
      if (res.ok) createdUsers++
      else failed++
    })
  )
  console.log(`${createdUsers} user(s) created, ${failed} falied`)
}
