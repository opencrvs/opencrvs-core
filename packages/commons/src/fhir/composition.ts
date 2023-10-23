import { Reference, ResourceIdentifier, SavedReference, URNReference } from '.'

export const MOTHER_CODE = 'mother-details'
export const FATHER_CODE = 'father-details'
export const CHILD_CODE = 'child-details'
export const DECEASED_CODE = 'deceased-details'
export const INFORMANT_CODE = 'informant-details'
export const WITNESS_ONE_CODE = 'witness-one-details'
export const WITNESS_TWO_CODE = 'witness-two-details'
export const SPOUSE_CODE = 'spouse-details'
export const BRIDE_CODE = 'bride-details'
export const GROOM_CODE = 'groom-details'

export const ATTACHMENT_DOCS_CODE = 'supporting-documents'

export const CORRECTION_CERTIFICATE_DOCS_CODE = 'correction-certificates'
export const CERTIFICATE_DOCS_CODE = 'certificates'

export const BIRTH_ENCOUNTER_CODE = 'birth-encounter'
export const MARRIAGE_ENCOUNTER_CODE = 'marriage-encounter'
export const DEATH_ENCOUNTER_CODE = 'death-encounter'
export const BIRTH_CORRECTION_ENCOUNTER_CODE = 'birth-correction-encounters'
export const DEATH_CORRECTION_ENCOUNTER_CODE = 'death-correction-encounters'
export const MARRIAGE_CORRECTION_ENCOUNTER_CODE =
  'marriage-correction-encounters'

export type CompositionSectionEncounterReference =
  | typeof BIRTH_ENCOUNTER_CODE
  | typeof MARRIAGE_ENCOUNTER_CODE
  | typeof DEATH_ENCOUNTER_CODE
  | typeof BIRTH_CORRECTION_ENCOUNTER_CODE
  | typeof DEATH_CORRECTION_ENCOUNTER_CODE
  | typeof MARRIAGE_CORRECTION_ENCOUNTER_CODE

type ReferenceType =
  | {
      code: typeof ATTACHMENT_DOCS_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof CORRECTION_CERTIFICATE_DOCS_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof CERTIFICATE_DOCS_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof BIRTH_ENCOUNTER_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof MARRIAGE_ENCOUNTER_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof DEATH_ENCOUNTER_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof BIRTH_CORRECTION_ENCOUNTER_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof DEATH_CORRECTION_ENCOUNTER_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof MARRIAGE_CORRECTION_ENCOUNTER_CODE
      reference: ResourceIdentifier | URNReference
    }
  | { code: typeof MOTHER_CODE; reference: ResourceIdentifier | URNReference }
  | { code: typeof FATHER_CODE; reference: ResourceIdentifier | URNReference }
  | { code: typeof CHILD_CODE; reference: ResourceIdentifier | URNReference }
  | { code: typeof DECEASED_CODE; reference: ResourceIdentifier | URNReference }
  | { code: typeof SPOUSE_CODE; reference: ResourceIdentifier | URNReference }
  | { code: typeof BRIDE_CODE; reference: ResourceIdentifier | URNReference }
  | { code: typeof GROOM_CODE; reference: ResourceIdentifier | URNReference }
  | {
      code: typeof INFORMANT_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof WITNESS_ONE_CODE
      reference: ResourceIdentifier | URNReference
    }
  | {
      code: typeof WITNESS_TWO_CODE
      reference: ResourceIdentifier | URNReference
    }

export type CompositionSectionCode = ReferenceType['code']

type ReferenceTypeByCode<U extends CompositionSectionCode> = Extract<
  ReferenceType,
  { code: U }
>

export type Section<Code extends CompositionSectionCode> = {
  title: string
  code: {
    coding: Array<{
      system:
        | 'http://opencrvs.org/doc-sections'
        | 'http://opencrvs.org/specs/sections'
      code: Code
    }>
    text: string
  }
  entry: Array<
    Omit<Reference, 'reference'> & {
      reference: ReferenceTypeByCode<Code>['reference']
    }
  >
}

export type SectionMappingByCode<U extends CompositionSectionCode> =
  ReferenceTypeByCode<U>['code']

export type CompositionSection = Section<ReferenceType['code']>

export type SavedCompositionSection = Omit<CompositionSection, 'entry'> & {
  entry: Array<SavedReference>
}
