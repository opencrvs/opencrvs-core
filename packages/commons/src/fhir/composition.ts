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
import { Reference, SavedReference, SavedComposition, Composition } from '.'

export const MOTHER_TITLE = "Mother's details"
export const FATHER_TITLE = "Father's details"
export const SPOUSE_TITLE = "Spouse's details"
export const CHILD_TITLE = 'Child details'
export const DECEASED_TITLE = 'Deceased details'
export const INFORMANT_TITLE = "Informant's details"
export const WITNESS_ONE_TITLE = "Witness One's details"
export const WITNESS_TWO_TITLE = "Witness Two's details"
export const BRIDE_TITLE = "Bride's details"
export const GROOM_TITLE = "Groom's details"

export const ATTACHMENT_DOCS_TITLE = 'Supporting Documents'

export const CORRECTION_CERTIFICATE_DOCS_TITLE = 'Correction certificates'
export const CERTIFICATE_DOCS_TITLE = 'Certificates'

export const BIRTH_ENCOUNTER_TITLE = 'Birth encounter'
export const MARRIAGE_ENCOUNTER_TITLE = 'Marriage encounter'
export const DEATH_ENCOUNTER_TITLE = 'Death encounter'
export const BIRTH_CORRECTION_ENCOUNTER_TITLE = 'Birth correction encounters'
export const DEATH_CORRECTION_ENCOUNTER_TITLE = 'Death correction encounters'
export const MARRIAGE_CORRECTION_ENCOUNTER_TITLE =
  'Marriage correction encounters'

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
      reference: Reference['reference']
      title: typeof ATTACHMENT_DOCS_TITLE
    }
  | {
      code: typeof CORRECTION_CERTIFICATE_DOCS_CODE
      reference: Reference['reference']
      title: typeof CORRECTION_CERTIFICATE_DOCS_TITLE
    }
  | {
      code: typeof CERTIFICATE_DOCS_CODE
      reference: Reference['reference']
      title: typeof CERTIFICATE_DOCS_TITLE
    }
  | {
      code: typeof BIRTH_ENCOUNTER_CODE
      reference: Reference['reference']
      title: typeof BIRTH_ENCOUNTER_TITLE
    }
  | {
      code: typeof MARRIAGE_ENCOUNTER_CODE
      reference: Reference['reference']
      title: typeof MARRIAGE_ENCOUNTER_TITLE
    }
  | {
      code: typeof DEATH_ENCOUNTER_CODE
      reference: Reference['reference']
      title: typeof DEATH_ENCOUNTER_TITLE
    }
  | {
      code: typeof BIRTH_CORRECTION_ENCOUNTER_CODE
      reference: Reference['reference']
      title: typeof BIRTH_CORRECTION_ENCOUNTER_TITLE
    }
  | {
      code: typeof DEATH_CORRECTION_ENCOUNTER_CODE
      reference: Reference['reference']
      title: typeof DEATH_CORRECTION_ENCOUNTER_TITLE
    }
  | {
      code: typeof MARRIAGE_CORRECTION_ENCOUNTER_CODE
      reference: Reference['reference']
      title: typeof MARRIAGE_CORRECTION_ENCOUNTER_TITLE
    }
  | {
      code: typeof MOTHER_CODE
      reference: Reference['reference']
      title: typeof MOTHER_TITLE
    }
  | {
      code: typeof FATHER_CODE
      reference: Reference['reference']
      title: typeof FATHER_TITLE
    }
  | {
      code: typeof CHILD_CODE
      reference: Reference['reference']
      title: typeof CHILD_TITLE
    }
  | {
      code: typeof DECEASED_CODE
      reference: Reference['reference']
      title: typeof DECEASED_TITLE
    }
  | {
      code: typeof SPOUSE_CODE
      reference: Reference['reference']
      title: typeof SPOUSE_TITLE
    }
  | {
      code: typeof BRIDE_CODE
      reference: Reference['reference']
      title: typeof BRIDE_TITLE
    }
  | {
      code: typeof GROOM_CODE
      reference: Reference['reference']
      title: typeof GROOM_TITLE
    }
  | {
      code: typeof INFORMANT_CODE
      reference: Reference['reference']
      title: typeof INFORMANT_TITLE
    }
  | {
      code: typeof WITNESS_ONE_CODE
      reference: Reference['reference']
      title: typeof WITNESS_ONE_TITLE
    }
  | {
      code: typeof WITNESS_TWO_CODE
      reference: Reference['reference']
      title: typeof WITNESS_TWO_TITLE
    }

export type CompositionSectionCode = ReferenceType['code']

type ReferenceTypeByCode<U extends CompositionSectionCode> = Extract<
  ReferenceType,
  { code: U }
>

export type CompositionSectionTitleByCode<T extends CompositionSectionCode> =
  ReferenceTypeByCode<T>['title']
export type CompositionSectionTitle = ReferenceType['title']

export type Section<Code extends CompositionSectionCode> = {
  title: ReferenceType['title'] // ReferenceTypeByCode<Code>['title'] requires ts ^5.1.2
  code: {
    coding: Array<{
      system:
        | 'http://opencrvs.org/doc-sections'
        | 'http://opencrvs.org/specs/sections'
      code: Code
    }>
    text: ReferenceType['title'] // ReferenceTypeByCode<Code>['title'] requires ts ^5.1.2
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

export function addRelatesToToComposition(
  composition: Composition | SavedComposition,
  relatesTo: NonNullable<Composition['relatesTo']>
) {
  return {
    ...composition,
    relatesTo: (composition.relatesTo ?? [])
      .filter(
        (rlt) =>
          !relatesTo.some((r) => {
            return (
              r.targetReference?.reference === rlt.targetReference?.reference
            )
          })
      )
      .concat(relatesTo)
  }
}
