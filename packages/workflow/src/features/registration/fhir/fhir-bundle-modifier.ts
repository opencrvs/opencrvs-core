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

import { UUID, logger } from '@opencrvs/commons'
import {
  Bundle,
  Composition,
  Patient,
  Practitioner,
  RegistrationStatus,
  ResourceIdentifier,
  Saved,
  Task,
  WaitingForValidationRecord,
  findExtension,
  getResourceFromBundleById,
  resourceIdentifierToUUID,
  SupportedPatientIdentifierCode
} from '@opencrvs/commons/types'
import { APPLICATION_CONFIG_URL, COUNTRY_CONFIG_URL } from '@workflow/constants'
import {
  OPENCRVS_SPECIFICATION_URL,
  RegStatus
} from '@workflow/features/registration/fhir/constants'
import { getSectionEntryBySectionCode } from '@workflow/features/registration/fhir/fhir-template'
import {
  fetchExistingRegStatusCode,
  getFromFhir,
  getRegStatusCode,
  updateResourceInHearth
} from '@workflow/features/registration/fhir/fhir-utils'
import { getMosipUINToken } from '@workflow/features/registration/utils'
import { getPractitionerRef } from '@workflow/features/user/utils'
import { ITokenPayload } from '@workflow/utils/auth-utils'
import fetch from 'node-fetch'

export async function invokeRegistrationValidation(
  bundle: Saved<Bundle>,
  headers: Record<string, string>
): Promise<Bundle> {
  const res = await fetch(
    new URL('event-registration', COUNTRY_CONFIG_URL).toString(),
    {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  )
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Error calling country configuration event-registration [${res.statusText} ${res.status}]: ${errorText}`
    )
  }
  return bundle
}

export async function setupRegistrationWorkflow(
  taskResource: Task,
  tokenpayload: ITokenPayload,
  defaultStatus?: RegistrationStatus
): Promise<Task> {
  const regStatusCodeString = defaultStatus
    ? defaultStatus
    : getRegStatusCode(tokenpayload)

  if (!taskResource.businessStatus) {
    taskResource.businessStatus = {} as Task['businessStatus']
  }
  if (!taskResource.businessStatus.coding) {
    taskResource.businessStatus.coding = []
  }
  const regStatusCode = taskResource.businessStatus.coding.find((code) => {
    return code.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
  })

  if (regStatusCode) {
    regStatusCode.code = regStatusCodeString
  } else {
    taskResource.businessStatus.coding.push({
      system: `${OPENCRVS_SPECIFICATION_URL}reg-status`,
      code: regStatusCodeString
    })
  }
  // Checking for duplicate status update
  await checkForDuplicateStatusUpdate(taskResource)

  return taskResource
}

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

async function checkForDuplicateStatusUpdate(taskResource: Task) {
  const regStatusCode =
    taskResource &&
    taskResource.businessStatus &&
    taskResource.businessStatus.coding &&
    taskResource.businessStatus.coding.find((code) => {
      return code.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
    })

  if (
    !taskResource ||
    !taskResource.id ||
    !regStatusCode ||
    regStatusCode.code === RegStatus.CERTIFIED
  ) {
    return
  }
  const existingRegStatusCode = await fetchExistingRegStatusCode(
    taskResource.id
  )
  if (existingRegStatusCode?.code === regStatusCode.code) {
    logger.error(`Declaration is already in ${regStatusCode} state`)
    throw new Error(`Declaration is already in ${regStatusCode} state`)
  }
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

interface Integration {
  name: string
  status: string
  integratingSystemType: 'MOSIP' | 'OTHER'
}

const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export async function validateDeceasedDetails(
  patient: Saved<Patient>,
  authHeader: { Authorization: string }
): Promise<Saved<Patient>> {
  /*
    In OCRVS-1637 https://github.com/opencrvs/opencrvs-core/pull/964 we attempted to create a longitudinal
    record of life events by an attempt to use an existing person in gateway if an identifier is supplied that we already
    have a record of in our system, rather than creating a new patient every time.

    However this supplied identifier cannot be trusted. This could lead to links between persons being abused or the wrong indivdual
    being marked as deceased.

    Any external identifier must be justifiably verified as authentic by a National ID system such as MOSIP or equivalent
  */

  const configResponse: Integration[] | undefined = await fetch(
    `${APPLICATION_CONFIG_URL}integrationConfig`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    }
  )
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Config request failed: ${error.message}`)
      )
    })
  logger.info('validateDeceasedDetails response successful')
  if (configResponse?.length) {
    const mosipIntegration = configResponse.filter((integration) => {
      return integration.integratingSystemType === 'MOSIP'
    })[0]
    if (mosipIntegration && mosipIntegration.status === statuses.ACTIVE) {
      logger.info('validateDeceasedDetails: MOSIP ENABLED')
      try {
        const mosipTokenSeederResponse = await getMosipUINToken(patient)
        logger.info(`MOSIP responded successfully`)
        if (
          (mosipTokenSeederResponse.errors &&
            mosipTokenSeederResponse.errors.length) ||
          !mosipTokenSeederResponse.response.authToken
        ) {
          logger.info(
            `MOSIP token request failed with errors: ${JSON.stringify(
              mosipTokenSeederResponse.errors
            )}`
          )
        } else if (mosipTokenSeederResponse.response.authStatus === false) {
          logger.info(
            `MOSIP token request failed with false authStatus: ${JSON.stringify(
              mosipTokenSeederResponse.errors
            )}`
          )
        } else {
          const birthPatientBundle: Bundle = await getFromFhir(
            `/Patient?identifier=${mosipTokenSeederResponse.response.authToken}`
          )
          logger.info(
            `Patient bundle returned by MOSIP Token Seeder search. Bundle id: ${birthPatientBundle.id}`
          )
          let birthPatient: Partial<Patient> & Pick<Patient, 'resourceType'> = {
            resourceType: 'Patient'
          }
          if (
            birthPatientBundle &&
            birthPatientBundle.entry &&
            birthPatientBundle.entry.length
          ) {
            birthPatientBundle.entry.forEach((entry) => {
              const bundlePatient = entry.resource as Patient
              const selectedIdentifier = bundlePatient.identifier?.filter(
                (identifier) => {
                  return (
                    identifier.type?.coding?.[0].code ===
                      'MOSIP_PSUT_TOKEN_ID' &&
                    identifier.value ===
                      mosipTokenSeederResponse.response.authToken
                  )
                }
              )[0]
              if (selectedIdentifier) {
                birthPatient = bundlePatient
              }
            })
          }
          logger.info(`birthPatient id: ${JSON.stringify(birthPatient.id)}`)
          if (
            birthPatient &&
            birthPatient.identifier &&
            birthPatient.resourceType
          ) {
            // If existing patient can be found
            // mark existing OpenCRVS birth patient as deceased with link to this patient
            // Keep both Patient copies as a history of name at birth, may not be that recorde for name at death etc ...
            // One should not overwrite the other
            birthPatient.deceasedBoolean = true
            birthPatient.identifier.push({
              type: {
                coding: [
                  {
                    system: `${OPENCRVS_SPECIFICATION_URL}identifier-type`,
                    code: 'DECEASED_PATIENT_ENTRY'
                  }
                ]
              },
              value: patient.id
            })

            await updateResourceInHearth(birthPatient)
            // mark patient with link to the birth patient
            patient.identifier?.push({
              type: {
                coding: [
                  {
                    system: `${OPENCRVS_SPECIFICATION_URL}identifier-type`,
                    code: 'BIRTH_PATIENT_ENTRY'
                  }
                ]
              },
              value: birthPatient.id!
            })
          }
        }
      } catch (err) {
        logger.info(`MOSIP token seeder request failed: ${JSON.stringify(err)}`)
      }
    }
  } else {
    // mosip not enabled
    /*
      TODO: Any internal OpenCRVS identifier (BRN) must be justifiably verified as authentic.

      If the form is enabled to submit a BRN in deceased form ...
      OpenCRVS needs a robust MOSIP-like verification model on the BRN
      We have to validate the bundle carefully against internal checks to find a legitimate birth patient.

      Ensure patient has link to the birth record if it exists.

    */
    //
  }
  return patient
}
