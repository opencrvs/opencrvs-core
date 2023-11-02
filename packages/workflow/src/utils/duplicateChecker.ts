import nodeFetch from 'node-fetch'
import { IAuthHeader } from '@opencrvs/commons'
import {
  BirthRegistration,
  DeathRegistration
} from '@workflow/../../commons/build/dist/types'
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

const findDeathDuplicates = async (
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

const findBirthDuplicates = async (
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

export async function hasBirthDuplicates(
  authHeader: IAuthHeader,
  birthRegDetails: BirthRegistration
) {
  if (!birthRegDetails || !birthRegDetails.child) {
    return false
  }

  const res = await findBirthDuplicates(authHeader, {
    motherIdentifier: birthRegDetails.mother?.identifier?.[0]?.id,
    childFirstNames: birthRegDetails.child.name?.[0]?.firstNames,
    childFamilyName: birthRegDetails.child.name?.[0]?.familyName,
    childDoB: birthRegDetails.child.birthDate,
    motherFirstNames: birthRegDetails.mother?.name?.[0]?.firstNames,
    motherFamilyName: birthRegDetails.mother?.name?.[0]?.familyName,
    motherDoB: birthRegDetails.mother?.birthDate
  })

  return !res || res.length > 0
}

export async function hasDeathDuplicates(
  authHeader: IAuthHeader,
  deathRegDetails: DeathRegistration
) {
  if (!deathRegDetails || !deathRegDetails.deceased) {
    return false
  }

  const res = await findDeathDuplicates(authHeader, {
    deceasedFirstNames: deathRegDetails.deceased?.name?.[0]?.firstNames,
    deceasedFamilyName: deathRegDetails.deceased?.name?.[0]?.familyName,
    deceasedIdentifier: deathRegDetails.deceased?.identifier?.[0]?.id,
    deceasedDoB: deathRegDetails.deceased?.birthDate,
    deathDate: deathRegDetails.deceased?.deceased?.deathDate
  })

  return !res || res.length > 0
}
