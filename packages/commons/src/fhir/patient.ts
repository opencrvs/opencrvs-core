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
    coding: Array<
      Omit<fhir3.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/identifier-type'
        code: string
      }
    >
  }
}

export type Patient = WithStrictExtensions<
  Omit<fhir3.Patient, 'name' | 'address' | 'identifier'> & {
    name: Array<OpenCRVSPatientName>
    address?: Address[]
    deceased?: boolean
    identifier?: PatientIdentifier[]
  }
>

export type OpenCRVSPatientName = Omit<fhir3.HumanName, 'use' | 'family'> & {
  use: string
  family: string[]
}
