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
import {
  Bundle,
  Reference,
  Resource,
  Saved,
  SavedReference,
  findCompositionSection,
  getComposition,
  getResourceFromBundleById,
  resourceIdentifierToUUID
} from '.'
import { UUID } from '..'

const DEATH_ENCOUNTER_CODE = 'death-encounter'
const BIRTH_ENCOUNTER_CODE = 'birth-encounter'
const MARRIAGE_ENCOUNTER_CODE = 'marriage-encounter'

export type Encounter = Omit<fhir3.Encounter, 'location' | 'status'> & {
  status: fhir3.Encounter['status'] | 'finished'
  location?: Array<{
    location: Reference
  }>
}

export type SavedEncounter = Omit<Encounter, 'location'> & {
  id: UUID
  location?: Array<{
    location: SavedReference
  }>
}

export function findEncounterFromRecord(
  record: Saved<Bundle>,
  code?:
    | typeof DEATH_ENCOUNTER_CODE
    | typeof BIRTH_ENCOUNTER_CODE
    | typeof MARRIAGE_ENCOUNTER_CODE
) {
  const composition = getComposition(record)
  if (!code) {
    const foundCode = (
      [
        DEATH_ENCOUNTER_CODE,
        BIRTH_ENCOUNTER_CODE,
        MARRIAGE_ENCOUNTER_CODE
      ] as const
    ).find((code) => findCompositionSection(code, composition))

    if (!foundCode) {
      return null
    }
    code = foundCode
  }
  const encounterSection = findCompositionSection(code, composition)

  if (!encounterSection) {
    return null
  }

  const encounterReference = encounterSection.entry[0].reference
  const encounter = getResourceFromBundleById<Encounter>(
    record,
    resourceIdentifierToUUID(encounterReference)
  )

  if (!encounter) {
    return null
  }
  return encounter
}

export function isEncounter(resource: Resource): resource is Encounter {
  return resource.resourceType === 'Encounter'
}
