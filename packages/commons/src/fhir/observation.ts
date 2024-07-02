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
import { Bundle, Resource, Saved, findEncounterFromRecord } from '.'

export const BODY_WEIGHT_CODE = '3141-9'
export const BIRTH_TYPE_CODE = '57722-1'
export const BIRTH_ATTENDANT_CODE = '73764-3'
export const NUMBER_BORN_ALIVE_CODE = 'num-born-alive'
export const NUMBER_FOEATAL_DEATH_CODE = 'num-foetal-death'
export const LAST_LIVE_BIRTH_CODE = '68499-3'
export const DEATH_DESCRIPTION_CODE =
  'lay-reported-or-verbal-autopsy-description'
export const CAUSE_OF_DEATH_ESTABLISHED_CODE = 'cause-of-death-established'
export const MANNER_OF_DEATH_CODE = 'uncertified-manner-of-death'
export const CAUSE_OF_DEATH_METHOD_CODE = 'cause-of-death-method'
export const CAUSE_OF_DEATH_CODE = 'ICD10'
export const MALE_DEPENDENTS_ON_DECEASED_CODE =
  'num-male-dependents-on-deceased'
export const FEMALE_DEPENDENTS_ON_DECEASED_CODE =
  'num-female-dependents-on-deceased'
export const MARRIAGE_TYPE_CODE = 'partnership'

type ObservationCode =
  | typeof BODY_WEIGHT_CODE
  | typeof BIRTH_TYPE_CODE
  | typeof BIRTH_ATTENDANT_CODE
  | typeof NUMBER_BORN_ALIVE_CODE
  | typeof NUMBER_FOEATAL_DEATH_CODE
  | typeof LAST_LIVE_BIRTH_CODE
  | typeof DEATH_DESCRIPTION_CODE
  | typeof CAUSE_OF_DEATH_ESTABLISHED_CODE
  | typeof MANNER_OF_DEATH_CODE
  | typeof CAUSE_OF_DEATH_METHOD_CODE
  | typeof CAUSE_OF_DEATH_CODE
  | typeof MALE_DEPENDENTS_ON_DECEASED_CODE
  | typeof FEMALE_DEPENDENTS_ON_DECEASED_CODE
  | typeof MARRIAGE_TYPE_CODE

// @todo should encounter be also taken into account?
// let's check correction behaviours
export function findObservationByCode(
  bundle: Saved<Bundle>,
  code: ObservationCode
) {
  const encounter = findEncounterFromRecord(bundle)

  if (!encounter) {
    return undefined
  }

  return bundle.entry
    .map((x) => x.resource)
    .filter(isObservation)
    .find(
      (observation) =>
        observation.context?.reference == `Encounter/${encounter.id}` &&
        observation.code?.coding?.[0].code == code
    )
}

export type Observation = Omit<
  fhir3.Observation,
  'valueQuantity' | 'valueString'
> & {
  valueInteger?: number
  valueString?: string | number
  valueQuantity?: Omit<fhir3.Quantity, 'value'> & {
    // Birth plurality of Pregnancy
    // { value: 'TWIN' }
    value: number | string
  }
}

export function isObservation(
  resource: Saved<Resource>
): resource is Saved<Observation>

export function isObservation(resource: Resource): resource is Observation {
  return resource.resourceType === 'Observation'
}
