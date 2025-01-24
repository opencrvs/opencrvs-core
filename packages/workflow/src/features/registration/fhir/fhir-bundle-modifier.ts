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

import { UUID } from '@opencrvs/commons'
import {
  Composition,
  Patient,
  Practitioner,
  ResourceIdentifier,
  Saved,
  Task,
  WaitingForValidationRecord,
  findExtension,
  getResourceFromBundleById,
  resourceIdentifierToUUID,
  SupportedPatientIdentifierCode,
  ValidRecord
} from '@opencrvs/commons/types'
import { OPENCRVS_SPECIFICATION_URL } from '@workflow/features/registration/fhir/constants'
import { getSectionEntryBySectionCode } from '@workflow/features/registration/fhir/fhir-template'
import { getPractitionerRef } from '@workflow/features/user/utils'
import { isEqual } from 'lodash'

export function setupLastRegOffice<T extends Task>(
  taskResource: T,
  practitionerOfficeId: UUID
): T {
  const regUserLastOfficeExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
    taskResource.extension
  )
  if (regUserLastOfficeExtension && regUserLastOfficeExtension.valueReference) {
    regUserLastOfficeExtension.valueReference.reference = `Location/${practitionerOfficeId}`
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
      valueReference: { reference: `Location/${practitionerOfficeId}` }
    })
  }
  return taskResource
}

export function setupLastRegUser<T extends Task>(
  taskResource: T,
  practitioner: Practitioner
): T {
  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const regUserExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
    taskResource.extension
  )
  if (regUserExtension && regUserExtension.valueReference) {
    regUserExtension.valueReference.reference = getPractitionerRef(practitioner)
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
      valueReference: { reference: getPractitionerRef(practitioner) }
    })
  }
  taskResource.lastModified =
    taskResource.lastModified || new Date().toISOString()
  return taskResource
}

export function updatePatientIdentifierWithRN(
  record: WaitingForValidationRecord,
  composition: Composition,
  sectionCodes: string[],
  identifierType: SupportedPatientIdentifierCode,
  registrationNumber: string
): Saved<Patient>[] {
  return sectionCodes.map((sectionCode) => {
    const sectionEntry = getSectionEntryBySectionCode(composition, sectionCode)
    const patientId = resourceIdentifierToUUID(
      sectionEntry.reference as ResourceIdentifier
    )
    const patient = getResourceFromBundleById<Patient>(record, patientId)

    if (!patient.identifier) {
      patient.identifier = []
    }
    const rnIdentifier = patient.identifier.find(
      (identifier: fhir3.Identifier) =>
        identifier.type?.coding?.[0].code === identifierType
    )
    if (rnIdentifier) {
      rnIdentifier.value = registrationNumber
    } else {
      patient.identifier.push({
        type: {
          coding: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}identifier-type`,
              code: identifierType
            }
          ]
        },
        value: registrationNumber
      })
    }
    return patient
  })
}

export function upsertPatientIdentifiers(
  record: ValidRecord,
  composition: Composition,
  sectionCodes: string[],
  identifiers: {
    type: SupportedPatientIdentifierCode
    value: string
  }[]
): Saved<Patient>[] {
  return sectionCodes.map((sectionCode) => {
    const sectionEntry = getSectionEntryBySectionCode(composition, sectionCode)
    const patientId = resourceIdentifierToUUID(
      sectionEntry.reference as ResourceIdentifier
    )
    const patient = getResourceFromBundleById<Patient>(record, patientId)

    if (!patient.identifier) {
      patient.identifier = []
    }
    identifiers.forEach((id) => {
      const existingIdentifier = patient.identifier!.find((existingId) =>
        isEqual(existingId.type, id.type)
      )
      if (existingIdentifier) {
        existingIdentifier.value = id.value
      } else {
        patient.identifier!.push({
          type: {
            coding: [
              {
                system: `${OPENCRVS_SPECIFICATION_URL}identifier-type`,
                code: id.type
              }
            ]
          },
          value: id.value
        })
      }
    })

    return patient
  })
}
