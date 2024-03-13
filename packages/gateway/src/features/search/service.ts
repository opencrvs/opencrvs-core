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
import { SEARCH_URL } from '@gateway/constants'

import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput
} from '@gateway/graphql/schema'
import { IAuthHeader } from '@opencrvs/commons'
import fetch from '@gateway/fetch'

type DeathDuplicateSearchBody = {
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedIdentifier?: string
  deceasedDoB?: string
  deathDate?: string
}
export const findDeathDuplicates = (
  authHeader: IAuthHeader,
  criteria: DeathDuplicateSearchBody
) => {
  return fetch(`${SEARCH_URL}search/duplicates/death`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify(criteria)
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Search request failed: ${error.message}`)
      )
    })
}

type BirthDuplicateSearchBody = {
  childFirstNames?: string
  childFamilyName?: string
  childDoB?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: string
  motherIdentifier?: string
}

export const findBirthDuplicates = (
  authHeader: IAuthHeader,
  criteria: BirthDuplicateSearchBody
) => {
  return fetch(`${SEARCH_URL}search/duplicates/birth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify(criteria)
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Search request failed: ${error.message}`)
      )
    })
}

export async function hasBirthDuplicates(
  authHeader: IAuthHeader,
  bundle: GQLBirthRegistrationInput
) {
  if (!bundle || !bundle.child) {
    return false
  }

  const res = await findBirthDuplicates(authHeader, {
    motherIdentifier: bundle.mother?.identifier?.[0]?.id,
    childFirstNames: bundle.child.name?.[0]?.firstNames,
    childFamilyName: bundle.child.name?.[0]?.familyName,
    childDoB: bundle.child.birthDate,
    motherFirstNames: bundle.mother?.name?.[0]?.firstNames,
    motherFamilyName: bundle.mother?.name?.[0]?.familyName,
    motherDoB: bundle.mother?.birthDate
  })

  return !res || res.length > 0
}

export async function hasDeathDuplicates(
  authHeader: IAuthHeader,
  bundle: GQLDeathRegistrationInput
) {
  if (!bundle || !bundle.deceased) {
    return false
  }

  const res = await findDeathDuplicates(authHeader, {
    deceasedFirstNames: bundle.deceased?.name?.[0]?.firstNames,
    deceasedFamilyName: bundle.deceased?.name?.[0]?.familyName,
    deceasedIdentifier: bundle.deceased?.identifier?.[0]?.id,
    deceasedDoB: bundle.deceased?.birthDate,
    deathDate: bundle.deceased?.deceased?.deathDate
  })

  return !res || res.length > 0
}
