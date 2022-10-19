/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  EVENT_TYPE,
  OPENCRVS_SPECIFICATION_URL,
  RegStatus
} from '@workflow/features/registration/fhir/constants'
import {
  getTaskResource,
  selectOrCreateTaskRefResource,
  getSectionEntryBySectionCode
} from '@workflow/features/registration/fhir/fhir-template'
import {
  getFromFhir,
  getRegStatusCode,
  fetchExistingRegStatusCode,
  updateResourceInHearth,
  mergePatientIdentifier
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  generateBirthTrackingId,
  generateDeathTrackingId,
  getEventType,
  getMosipUINToken,
  isEventNotification,
  isInProgressDeclaration
} from '@workflow/features/registration/utils'
import {
  getLoggedInPractitionerResource,
  getPractitionerOffice,
  getPractitionerPrimaryLocation,
  getPractitionerRef
} from '@workflow/features/user/utils'
import { logger } from '@workflow/logger'
import {
  APPLICATION_CONFIG_URL,
  RESOURCE_SERVICE_URL
} from '@workflow/constants'
import {
  getTokenPayload,
  ITokenPayload,
  USER_SCOPE
} from '@workflow/utils/authUtils'
import fetch from 'node-fetch'
import { checkFormDraftStatusToAddTestExtension } from '@workflow/utils/formDraftUtils'
import { REQUEST_CORRECTION_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
export interface ITaskBundleEntry extends fhir.BundleEntry {
  resource: fhir.Task
}

export async function modifyRegistrationBundle(
  fhirBundle: fhir.Bundle,
  token: string
): Promise<fhir.Bundle> {
  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    fail('Invalid FHIR bundle found for declaration')
    throw new Error('Invalid FHIR bundle found for declaration')
  }
  /* setting unique trackingid here */
  fhirBundle = setTrackingId(fhirBundle)

  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task
  const eventType = getEventType(fhirBundle)
  /* setting registration type here */
  setupRegistrationType(taskResource, eventType)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    isInProgressDeclaration(fhirBundle)
      ? RegStatus.IN_PROGRESS
      : RegStatus.DECLARED
  )

  const practitioner = await getLoggedInPractitionerResource(token)
  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  if (!isEventNotification(fhirBundle)) {
    /* setting lastRegLocation here */
    await setupLastRegLocation(taskResource, practitioner)
  }

  /* check if the status of any event draft is not published and setting configuration extension*/
  await checkFormDraftStatusToAddTestExtension(taskResource, token)

  /* setting author and time on notes here */
  setupAuthorOnNotes(taskResource, practitioner)

  return fhirBundle
}

export async function markBundleAsValidated(
  bundle: fhir.Bundle & fhir.BundleEntry,
  token: string
): Promise<fhir.Bundle & fhir.BundleEntry> {
  const taskResource = getTaskResource(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    RegStatus.VALIDATED
  )

  await setupLastRegLocation(taskResource, practitioner)

  setupLastRegUser(taskResource, practitioner)

  /* check if the status of any event draft is not published and setting configuration extension*/
  await checkFormDraftStatusToAddTestExtension(taskResource, token)

  return bundle
}

export async function markBundleAsRequestedForCorrection(
  bundle: fhir.Bundle & fhir.BundleEntry,
  token: string
): Promise<fhir.Bundle & fhir.BundleEntry> {
  const taskResource = getTaskResource(bundle)
  const practitioner = await getLoggedInPractitionerResource(token)
  const regStatusCode = await fetchExistingRegStatusCode(taskResource.id)
  await mergePatientIdentifier(bundle)

  if (!taskResource.extension) {
    taskResource.extension = []
  }
  taskResource.extension.push({
    url: REQUEST_CORRECTION_EXTENSION_URL,
    valueString: regStatusCode?.code
  })

  await setupLastRegLocation(taskResource, practitioner)

  setupLastRegUser(taskResource, practitioner)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    regStatusCode?.code
  )

  /* check if the status of any event draft is not published and setting configuration extension*/
  await checkFormDraftStatusToAddTestExtension(taskResource, token)

  return bundle
}

export async function invokeRegistrationValidation(
  bundle: fhir.Bundle,
  token: string
) {
  try {
    await fetch(`${RESOURCE_SERVICE_URL}validate/registration`, {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
  } catch (err) {
    throw new Error(`Unable to send registration for validation: ${err}`)
  }
}

export async function markBundleAsWaitingValidation(
  bundle: fhir.Bundle & fhir.BundleEntry,
  token: string
): Promise<fhir.Bundle & fhir.BundleEntry> {
  const taskResource = getTaskResource(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    RegStatus.WAITING_VALIDATION
  )

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  /* check if the status of any event draft is not published and setting configuration extension*/
  await checkFormDraftStatusToAddTestExtension(taskResource, token)

  return bundle
}

export async function markBundleAsDeclarationUpdated(
  bundle: fhir.Bundle & fhir.BundleEntry,
  token: string
): Promise<fhir.Bundle & fhir.BundleEntry> {
  const taskResource = getTaskResource(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    RegStatus.DECLARATION_UPDATED
  )

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  /* check if the status of any event draft is not published and setting configuration extension*/
  await checkFormDraftStatusToAddTestExtension(taskResource, token)

  return bundle
}

export async function markEventAsRegistered(
  taskResource: fhir.Task,
  registrationNumber: string,
  eventType: EVENT_TYPE,
  token: string
): Promise<fhir.Task> {
  /* Setting registration number here */
  let identifierName
  if (eventType === EVENT_TYPE.BIRTH) {
    identifierName = 'birth-registration-number'
  } else if (eventType === EVENT_TYPE.DEATH) {
    identifierName = 'death-registration-number'
  }

  if (taskResource && taskResource.identifier) {
    taskResource.identifier.push({
      system: `${OPENCRVS_SPECIFICATION_URL}id/${identifierName}`,
      value: registrationNumber
    })
  }

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    RegStatus.REGISTERED
  )

  return taskResource
}

export async function markBundleAsCertified(
  bundle: fhir.Bundle,
  token: string
): Promise<fhir.Bundle> {
  const taskResource = getTaskResource(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    RegStatus.CERTIFIED
  )

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  /* check if the status of any event draft is not published and setting configuration extension*/
  await checkFormDraftStatusToAddTestExtension(taskResource, token)

  return bundle
}

export async function touchBundle(
  bundle: fhir.Bundle,
  token: string
): Promise<fhir.Bundle> {
  const taskResource = getTaskResource(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  const payload = getTokenPayload(token)
  /* setting lastRegLocation here */
  if (!payload.scope.includes(USER_SCOPE.RECORD_SEARCH)) {
    await setupLastRegLocation(taskResource, practitioner)
  }

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  /* check if the status of any event draft is not published and setting configuration extension*/
  await checkFormDraftStatusToAddTestExtension(taskResource, token)

  return bundle
}

export function setTrackingId(fhirBundle: fhir.Bundle): fhir.Bundle {
  let trackingId: string
  let trackingIdFhirName: string
  const eventType = getEventType(fhirBundle)
  if (eventType === EVENT_TYPE.BIRTH) {
    trackingId = generateBirthTrackingId()
    trackingIdFhirName = 'birth-tracking-id'
  } else {
    trackingId = generateDeathTrackingId()
    trackingIdFhirName = 'death-tracking-id'
  }

  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    fail('Invalid FHIR bundle found for declaration')
    throw new Error('Invalid FHIR bundle found for declaration')
  }

  const compositionResource = fhirBundle.entry[0].resource as fhir.Composition
  if (!compositionResource.identifier) {
    compositionResource.identifier = {
      system: 'urn:ietf:rfc:3986',
      value: trackingId
    }
  } else {
    compositionResource.identifier.value = trackingId
  }
  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task
  if (!taskResource.identifier) {
    taskResource.identifier = []
  }
  const existingTrackingId = taskResource.identifier.find(
    (identifier) =>
      identifier.system ===
      `${OPENCRVS_SPECIFICATION_URL}id/${trackingIdFhirName}`
  )

  if (existingTrackingId) {
    existingTrackingId.value = trackingId
  } else {
    taskResource.identifier.push({
      system: `${OPENCRVS_SPECIFICATION_URL}id/${trackingIdFhirName}`,
      value: trackingId
    })
  }

  return fhirBundle
}

export function setupRegistrationType(
  taskResource: fhir.Task,
  eventType: EVENT_TYPE
): fhir.Task {
  if (!taskResource.code || !taskResource.code.coding) {
    taskResource.code = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}types`,
          code: eventType.toString()
        }
      ]
    }
  } else {
    taskResource.code.coding[0].code = eventType.toString()
  }
  return taskResource
}

export async function setupRegistrationWorkflow(
  taskResource: fhir.Task,
  tokenpayload: ITokenPayload,
  defaultStatus?: string
): Promise<fhir.Task> {
  const regStatusCodeString = defaultStatus
    ? defaultStatus
    : getRegStatusCode(tokenpayload)

  if (!taskResource.businessStatus) {
    taskResource.businessStatus = {}
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

export async function setupLastRegLocation(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner
): Promise<fhir.Task> {
  if (!practitioner || !practitioner.id) {
    throw new Error('Invalid practitioner data found')
  }
  const location = await getPractitionerPrimaryLocation(practitioner.id)
  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const regUserLastLocationExtension = taskResource.extension.find(
    (extension) => {
      return (
        extension.url ===
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`
      )
    }
  )
  if (
    regUserLastLocationExtension &&
    regUserLastLocationExtension.valueReference
  ) {
    regUserLastLocationExtension.valueReference.reference = `Location/${location.id}`
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
      valueReference: { reference: `Location/${location.id}` }
    })
  }

  const primaryOffice = await getPractitionerOffice(practitioner.id)

  const regUserLastOfficeExtension = taskResource.extension.find(
    (extension) => {
      return (
        extension.url === `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`
      )
    }
  )
  if (regUserLastOfficeExtension && regUserLastOfficeExtension.valueReference) {
    regUserLastOfficeExtension.valueReference.reference = `Location/${primaryOffice.id}`
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
      valueString: primaryOffice.name,
      valueReference: { reference: `Location/${primaryOffice.id}` }
    })
  }
  return taskResource
}

export function setupLastRegUser(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner
): fhir.Task {
  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const regUserExtension = taskResource.extension.find((extension) => {
    return (
      extension.url === `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`
    )
  })
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

export function setupTestExtension(taskResource: fhir.Task): fhir.Task {
  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const testExtension = taskResource.extension.find((extension) => {
    return (
      extension.url === `${OPENCRVS_SPECIFICATION_URL}extension/configuration`
    )
  })
  if (testExtension && testExtension.valueReference) {
    testExtension.valueReference.reference = 'IN_CONFIGURATION'
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/configuration`,
      valueReference: { reference: 'IN_CONFIGURATION' }
    })
  }
  taskResource.lastModified =
    taskResource.lastModified || new Date().toISOString()
  return taskResource
}

export function setupAuthorOnNotes(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner
): fhir.Task {
  if (!taskResource.note) {
    return taskResource
  }
  const authorName = getPractitionerRef(practitioner)
  taskResource.note.forEach((note) => {
    if (!note.authorString) {
      note.authorString = authorName
    }
  })
  return taskResource
}

export async function checkForDuplicateStatusUpdate(taskResource: fhir.Task) {
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
  if (existingRegStatusCode && existingRegStatusCode.code === regStatusCode) {
    logger.error(`Declaration is already in ${regStatusCode} state`)
    throw new Error(`Declaration is already in ${regStatusCode} state`)
  }
}

export async function updatePatientIdentifierWithRN(
  composition: fhir.Composition,
  sectionCode: string,
  identifierType: string,
  registrationNumber: string
): Promise<fhir.Patient> {
  const section = getSectionEntryBySectionCode(composition, sectionCode)
  const patient: fhir.Patient = await getFromFhir(`/${section.reference}`)
  if (!patient.identifier) {
    patient.identifier = []
  }
  const rnIdentifier = patient.identifier.find(
    (identifier) => identifier.type === identifierType
  )
  if (rnIdentifier) {
    rnIdentifier.value = registrationNumber
  } else {
    patient.identifier.push({
      // @ts-ignore
      // Need to fix client/src/forms/mappings/mutation/field-mappings.ts:L93
      // type should have CodeableConcept instead of string
      // Need to fix in both places together along with a script for legacy data update
      type: identifierType,
      value: registrationNumber
    })
  }
  return patient
}

interface IIntegration {
  name: string
  status: string
}
interface IApplicationConfig {
  INTEGRATIONS: [IIntegration]
}

export interface IApplicationConfigResponse {
  config: IApplicationConfig
}

const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export async function validateDeceasedDetails(
  patient: fhir.Patient,
  authHeader: { Authorization: string }
): Promise<fhir.Patient> {
  /*
    In OCRVS-1637 https://github.com/opencrvs/opencrvs-core/pull/964 we attempted to create a longitudinal
    record of life events by an attempt to use an existing person in gateway if an identifier is supplied that we already
    have a record of in our system, rather than creating a new patient every time.

    However this supplied identifier cannot be trusted. This could lead to links between persons being abused or the wrong indivdual
    being marked as deceased.

    Any external identifier must be justifiably verified as authentic by a National ID system such as MOSIP or equivalent
  */

  const configResponse: IApplicationConfigResponse = await fetch(
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
  logger.info(
    `validateDeceasedDetails: configResponse ${JSON.stringify(configResponse)}`
  )
  if (
    configResponse &&
    configResponse.config.INTEGRATIONS &&
    configResponse.config.INTEGRATIONS.length
  ) {
    const mosipIntegration = configResponse.config.INTEGRATIONS.filter(
      (integration) => {
        return integration.name === 'MOSIP'
      }
    )[0]
    if (mosipIntegration.status === statuses.ACTIVE) {
      logger.info('validateDeceasedDetails: MOSIP ENABLED')
      try {
        const mosipTokenSeederResponse = await getMosipUINToken(patient)
        logger.info(
          `MOSIP RESPONSE: ${JSON.stringify(mosipTokenSeederResponse)}`
        )
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
          const birthPatientBundle: fhir.Bundle = await getFromFhir(
            `/Patient?identifier=${mosipTokenSeederResponse.response.authToken}`
          )
          logger.info(
            `Patient bundle returned by MOSIP Token Seeder search: ${JSON.stringify(
              birthPatientBundle
            )}`
          )
          let birthPatient: fhir.Patient = {}
          if (
            birthPatientBundle &&
            birthPatientBundle.entry &&
            birthPatientBundle.entry.length
          ) {
            birthPatientBundle.entry.forEach((entry) => {
              const bundlePatient = entry.resource as fhir.Patient
              const selectedIdentifier = bundlePatient.identifier?.filter(
                (identifier) => {
                  return (
                    identifier.type === 'MOSIP_UINTOKEN' &&
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
          logger.info(`birthPatient: ${JSON.stringify(birthPatient)}`)
          if (birthPatient && birthPatient.identifier) {
            // If existing patient can be found
            // mark existing OpenCRVS birth patient as deceased with link to this patient
            // Keep both Patient copies as a history of name at birth, may not be that recorde for name at death etc ...
            // One should not overwrite the other
            birthPatient.deceasedBoolean = true
            birthPatient.identifier.push({
              type: 'DECEASED_PATIENT_ENTRY',
              value: patient.id
            } as fhir.CodeableConcept)
            await updateResourceInHearth(birthPatient)
            // mark patient with link to the birth patient
            patient.identifier?.push({
              type: 'BIRTH_PATIENT_ENTRY',
              value: birthPatient.id
            } as fhir.CodeableConcept)
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
