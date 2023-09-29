import { Bundle, Resource, Saved, getEncounterFromRecord } from '.'

const BODY_WEIGHT_CODE = '3141-9'
const BIRTH_TYPE_CODE = '57722-1'
const BIRTH_ATTENDANT_CODE = '73764-3'
const NUMBER_BORN_ALIVE_CODE = 'num-born-alive'
const NUMBER_FOEATAL_DEATH_CODE = 'num-foetal-death'
const LAST_LIVE_BIRTH_CODE = '68499-3'
const DEATH_DESCRIPTION_CODE = 'lay-reported-or-verbal-autopsy-description'
const CAUSE_OF_DEATH_ESTABLISHED_CODE = 'cause-of-death-established'
const MANNER_OF_DEATH_CODE = 'uncertified-manner-of-death'
const CAUSE_OF_DEATH_METHOD_CODE = 'cause-of-death-method'
const CAUSE_OF_DEATH_CODE = 'ICD10'
const MALE_DEPENDENTS_ON_DECEASED_CODE = 'num-male-dependents-on-deceased'
const FEMALE_DEPENDENTS_ON_DECEASED_CODE = 'num-female-dependents-on-deceased'
const MARRIAGE_TYPE_CODE = 'partnership'

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
  const encounter = getEncounterFromRecord(bundle)
  return bundle.entry
    .map((x) => x.resource)
    .filter(isObservation)
    .find(
      (observation) =>
        observation.context?.reference == `Encounter/${encounter.id}` &&
        observation.code?.coding?.[0].code == code
    )
}

export type Observation = Omit<fhir3.Observation, 'valueQuantity'> & {
  valueInteger?: number
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

export function isSavedObservation(
  resource: Saved<Resource>
): resource is Saved<Observation> {
  return resource.resourceType === 'Observation'
}
