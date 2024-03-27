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
import nodeFetch from 'node-fetch'
import { IAuthHeader } from '@opencrvs/commons'
import {
  addExtensionsToTask,
  addRelatesToToComposition,
  BirthRegistration,
  Composition,
  DeathRegistration,
  EVENT_TYPE,
  Extension,
  FLAGGED_AS_POTENTIAL_DUPLICATE,
  SavedTask
} from '@opencrvs/commons/types'
import { SEARCH_URL } from '@workflow/constants'

type DeathDuplicateSearchBody = {
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedIdentifier?: string
  deceasedDoB?: string
  deathDate?: string
}

function fetch(...params: Parameters<typeof nodeFetch>) {
  return nodeFetch(...params)
}

const searchDeathDuplicates = async (
  authHeader: IAuthHeader,
  criteria: DeathDuplicateSearchBody
) => {
  try {
    const response = await fetch(`${SEARCH_URL}search/duplicates/death`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(criteria)
    })
    return await response.json()
  } catch (error) {
    return await Promise.reject(
      new Error(`Search request failed: ${error.message}`)
    )
  }
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

const searchBirthDuplicates = async (
  authHeader: IAuthHeader,
  criteria: BirthDuplicateSearchBody
) => {
  try {
    const response = await fetch(`${SEARCH_URL}search/duplicates/birth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(criteria)
    })
    return await response.json()
  } catch (error) {
    return await Promise.reject(
      new Error(`Search request failed: ${error.message}`)
    )
  }
}

async function findBirthDuplicateIds(
  authHeader: IAuthHeader,
  birthRegDetails: BirthRegistration
): Promise<{ id: string; trackingId: string }[]> {
  if (!birthRegDetails || !birthRegDetails.child) {
    return []
  }

  const res = await searchBirthDuplicates(authHeader, {
    motherIdentifier: birthRegDetails.mother?.identifier?.[0]?.id,
    childFirstNames: birthRegDetails.child.name?.[0]?.firstNames,
    childFamilyName: birthRegDetails.child.name?.[0]?.familyName,
    childDoB: birthRegDetails.child.birthDate,
    motherFirstNames: birthRegDetails.mother?.name?.[0]?.firstNames,
    motherFamilyName: birthRegDetails.mother?.name?.[0]?.familyName,
    motherDoB: birthRegDetails.mother?.birthDate
  })

  return res
}

async function findDeathDuplicateIds(
  authHeader: IAuthHeader,
  deathRegDetails: DeathRegistration
): Promise<{ id: string; trackingId: string }[]> {
  if (!deathRegDetails || !deathRegDetails.deceased) {
    return []
  }

  const res = await searchDeathDuplicates(authHeader, {
    deceasedFirstNames: deathRegDetails.deceased?.name?.[0]?.firstNames,
    deceasedFamilyName: deathRegDetails.deceased?.name?.[0]?.familyName,
    deceasedIdentifier: deathRegDetails.deceased?.identifier?.[0]?.id,
    deceasedDoB: deathRegDetails.deceased?.birthDate,
    deathDate: deathRegDetails.deceased?.deceased?.deathDate
  })

  return res
}

export async function findDuplicateIds(
  registrationDetails: BirthRegistration | DeathRegistration,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  if (event === EVENT_TYPE.BIRTH) {
    return findBirthDuplicateIds(
      authHeader,
      registrationDetails as BirthRegistration
    )
  } else if (event === EVENT_TYPE.DEATH) {
    return findDeathDuplicateIds(
      authHeader,
      registrationDetails as DeathRegistration
    )
  }
  // NOT IMPLEMENTED FOR MARRIAGE
  return []
}

export function updateTaskWithDuplicateIds(
  task: SavedTask,
  duplicateIds: { id: string; trackingId: string }[]
) {
  const extension: Extension = {
    url: FLAGGED_AS_POTENTIAL_DUPLICATE,
    valueString: duplicateIds
      .map((duplicate) => duplicate.trackingId)
      .toString()
  }
  return addExtensionsToTask(
    {
      ...task,
      lastModified: new Date().toISOString()
    },
    [extension]
  ) as SavedTask
}

export function updateCompositionWithDuplicateIds(
  composition: Composition,
  duplicateIds: { id: string; trackingId: string }[]
) {
  const relatesTo: NonNullable<Composition['relatesTo']> = duplicateIds.map(
    (duplicate) => ({
      code: 'duplicate',
      targetReference: {
        reference: `Composition/${duplicate.id}`
      }
    })
  )
  return addRelatesToToComposition(composition, relatesTo)
}
