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
import * as Hapi from '@hapi/hapi'
import { UUID } from '@opencrvs/commons'
import {
  Bundle,
  Composition,
  Patient,
  Practitioner,
  RegistrationNumber,
  Saved,
  Task,
  findExtension,
  RegistrationStatus,
  WaitingForValidationRecord,
  getResourceFromBundleById,
  ResourceIdentifier,
  resourceIdentifierToUUID
} from '@opencrvs/commons/types'
import { APPLICATION_CONFIG_URL, COUNTRY_CONFIG_URL } from '@workflow/constants'
import {
  EVENT_TYPE,
  OPENCRVS_SPECIFICATION_URL,
  RegStatus
} from '@workflow/features/registration/fhir/constants'
import {
  getSectionEntryBySectionCode,
  getTaskResourceFromFhirBundle
} from '@workflow/features/registration/fhir/fhir-template'
import {
  fetchExistingRegStatusCode,
  getFromFhir,
  getRegStatusCode,
  updateResourceInHearth
} from '@workflow/features/registration/fhir/fhir-utils'
import { getMosipUINToken } from '@workflow/features/registration/utils'
import {
  getLoggedInPractitionerResource,
  getPractitionerOffice,
  getPractitionerPrimaryLocation,
  getPractitionerRef,
  getSystem
} from '@workflow/features/user/utils'
import { logger } from '@workflow/logger'
import {
  ITokenPayload,
  USER_SCOPE,
  getToken,
  getTokenPayload
} from '@workflow/utils/auth-utils'
import fetch from 'node-fetch'

export async function markBundleAsValidated<T extends Bundle>(
  bundle: T,
  token: string
): Promise<T> {
  const taskResource = getTaskResourceFromFhirBundle(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    RegStatus.VALIDATED
  )

  await setupLastRegLocation(taskResource, practitioner)

  setupLastRegUser(taskResource, practitioner)

  return bundle
}

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
    const errorData = await res.json()
    throw `System error: ${res.statusText} ${res.status} ${errorData.msg}`
  }
  return bundle
}

export async function markBundleAsWaitingValidation<T extends Bundle>(
  bundle: T,
  token: string
): Promise<T> {
  const taskResource = getTaskResourceFromFhirBundle(bundle)

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

  return bundle
}

export async function markBundleAsDeclarationUpdated<T extends Bundle>(
  bundle: T,
  token: string
): Promise<T> {
  const taskResource = getTaskResourceFromFhirBundle(bundle)

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

  return bundle
}

export async function markEventAsRegistered(
  taskResource: Task,
  registrationNumber: RegistrationNumber,
  eventType: EVENT_TYPE,
  token: string
): Promise<Task> {
  /* Setting registration number here */
  const system = `${OPENCRVS_SPECIFICATION_URL}id/${
    eventType.toLowerCase() as Lowercase<typeof eventType>
  }-registration-number` as const

  if (taskResource && taskResource.identifier) {
    taskResource.identifier.push({
      system: system,
      value: registrationNumber as RegistrationNumber
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
  bundle: Bundle,
  token: string
): Promise<Bundle> {
  const taskResource = getTaskResourceFromFhirBundle(bundle)

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

  return bundle
}

export function makeTaskAnonymous(bundle: Bundle) {
  const taskResource = getTaskResourceFromFhirBundle(bundle)

  taskResource.extension = taskResource.extension?.filter(
    ({ url }) =>
      ![
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`
      ].includes(url)
  )

  return bundle
}

export async function markBundleAsIssued(
  bundle: Bundle,
  token: string
): Promise<Bundle> {
  const taskResource = getTaskResourceFromFhirBundle(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    RegStatus.ISSUED
  )

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  return bundle
}

export async function touchBundle(
  bundle: Bundle,
  token: string
): Promise<Bundle> {
  const taskResource = getTaskResourceFromFhirBundle(bundle)

  const practitioner = await getLoggedInPractitionerResource(token)

  const payload = getTokenPayload(token)
  /* setting lastRegLocation here */
  if (!payload.scope.includes(USER_SCOPE.RECORD_SEARCH)) {
    await setupLastRegLocation(taskResource, practitioner)
  }

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  return bundle
}

export function setupRegistrationType(
  taskResource: Task,
  eventType: EVENT_TYPE
): Task {
  if (!taskResource.code || !taskResource.code.coding) {
    taskResource.code = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}types`,
          code: eventType
        }
      ]
    }
  } else {
    taskResource.code.coding[0].code = eventType
  }
  return taskResource
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

export async function setupLastRegLocation<T extends Task>(
  taskResource: T,
  practitioner: Practitioner
): Promise<T> {
  if (!practitioner || !practitioner.id) {
    throw new Error('Invalid practitioner data found')
  }
  const location = await getPractitionerPrimaryLocation(practitioner.id)
  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const regUserLastLocationExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
    taskResource.extension
  )
  if (
    regUserLastLocationExtension &&
    regUserLastLocationExtension.valueReference
  ) {
    regUserLastLocationExtension.valueReference.reference = `Location/${
      location.id as UUID
    }` as const
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
      valueReference: { reference: `Location/${location.id as UUID}` }
    })
  }

  const primaryOffice = await getPractitionerOffice(practitioner.id)

  const regUserLastOfficeExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
    taskResource.extension
  )
  if (regUserLastOfficeExtension && regUserLastOfficeExtension.valueReference) {
    regUserLastOfficeExtension.valueReference.reference = `Location/${primaryOffice.id}`
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
      valueString: primaryOffice.name!,
      valueReference: { reference: `Location/${primaryOffice.id}` }
    })
  }
  return taskResource
}

const SYSTEM_SCOPES = ['recordsearch', 'notification-api']

function isSystemInitiated(scopes: string[] | undefined) {
  return Boolean(scopes?.some((scope) => SYSTEM_SCOPES.includes(scope)))
}

export async function setupSystemIdentifier(request: Hapi.Request) {
  const token = getToken(request)
  const { sub: systemId } = getTokenPayload(token)
  const bundle = request.payload as Bundle
  const taskResource = getTaskResourceFromFhirBundle(bundle)
  const systemIdentifierUrl =
    `${OPENCRVS_SPECIFICATION_URL}id/system_identifier` as const

  if (!isSystemInitiated(request.auth.credentials.scope)) {
    return
  }

  if (!taskResource.identifier) {
    taskResource.identifier = []
  }

  taskResource.identifier = taskResource.identifier.filter(
    ({ system }) => system != systemIdentifierUrl
  )

  const systemInformation = await getSystem(systemId, {
    Authorization: `Bearer ${token}`
  })

  const { name, username, type } = systemInformation
  const systemInformationJSON = { name, username, type }

  taskResource.identifier.push({
    system: systemIdentifierUrl,
    value: JSON.stringify(systemInformationJSON)
  })
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

export function setupAuthorOnNotes(
  taskResource: Task,
  practitioner: Practitioner
): Task {
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

export async function checkForDuplicateStatusUpdate(taskResource: Task) {
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
  identifierType: string,
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
              value: birthPatient.id
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
