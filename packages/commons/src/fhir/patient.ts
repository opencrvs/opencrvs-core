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
import { Address, Resource, WithStrictExtensions } from '.'

export function isPatient<T extends Resource>(
  resource: T
): resource is T & Patient {
  return resource.resourceType === 'Patient'
}

export type PatientIdentifier = Omit<fhir3.Identifier, 'type'> & {
  otherType?: string
  fieldsModifiedByIdentity?: string[]
  type: Omit<fhir3.CodeableConcept, 'coding'> & {
    coding: [
      Omit<fhir3.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/identifier-type'
        code: SupportedPatientIdentifierCode
      }
    ]
  }
  value: string
}

export type Patient = WithStrictExtensions<
  Omit<fhir3.Patient, 'name' | 'address' | 'identifier'> & {
    name: Array<OpenCRVSPatientName>
    address?: Address[]
    deceased?: boolean
    identifier?: PatientIdentifier[]
  }
>

export type OpenCRVSPatientName = Omit<fhir3.HumanName, 'use'> & {
  use: string
}

export const SUPPORTED_PATIENT_IDENTIFIER_CODES = [
  'PASSPORT',
  'NATIONAL_ID',
  'DECEASED_PATIENT_ENTRY',
  'BIRTH_PATIENT_ENTRY',
  'DRIVING_LICENSE',
  'REFUGEE_NUMBER',
  'ALIEN_NUMBER',
  'OTHER',
  'SOCIAL_SECURITY_NO',
  'BIRTH_REGISTRATION_NUMBER',
  'DEATH_REGISTRATION_NUMBER',
  'MARRIAGE_REGISTRATION_NUMBER',
  'BIRTH_CONFIGURABLE_IDENTIFIER_1',
  'BIRTH_CONFIGURABLE_IDENTIFIER_2',
  'BIRTH_CONFIGURABLE_IDENTIFIER_3'
] as const

export type SupportedPatientIdentifierCode =
  (typeof SUPPORTED_PATIENT_IDENTIFIER_CODES)[number]

export const findPatientIdentifier = (
  patient: Patient,
  identifierCodes: Array<SupportedPatientIdentifierCode>
) => {
  return patient.identifier?.find((identifier) =>
    identifierCodes.includes(identifier.type.coding[0].code)
  )
}
