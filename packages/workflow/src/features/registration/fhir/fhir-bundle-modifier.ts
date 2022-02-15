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
  REG_STATUS_CERTIFIED,
  REG_STATUS_DECLARED,
  REG_STATUS_IN_PROGRESS,
  REG_STATUS_VALIDATED,
  REG_STATUS_WAITING_VALIDATION,
  REG_STATUS_REGISTERED,
  REG_STATUS_REQUESTED_CORRECTION
} from '@workflow/features/registration/fhir/constants'
import {
  getTaskResource,
  selectOrCreateTaskRefResource,
  getSectionEntryBySectionCode
} from '@workflow/features/registration/fhir/fhir-template'
import {
  getFromFhir,
  getRegStatusCode
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  generateBirthTrackingId,
  generateDeathTrackingId,
  getEventType,
  isEventNotification,
  isInProgressApplication
} from '@workflow/features/registration/utils'
import {
  getLoggedInPractitionerResource,
  getPractitionerOffice,
  getPractitionerPrimaryLocation,
  getPractitionerRef
} from '@workflow/features/user/utils'
import { logger } from '@workflow/logger'
import { getTokenPayload, ITokenPayload } from '@workflow/utils/authUtils'
import { RESOURCE_SERVICE_URL } from '@workflow/constants'
import fetch from 'node-fetch'

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
  // tslint:disable-next-line
  fhirBundle = setTrackingId(fhirBundle)

  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task
  const eventType = getEventType(fhirBundle)
  /* setting registration type here */
  setupRegistrationType(taskResource, eventType)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    isInProgressApplication(fhirBundle)
      ? REG_STATUS_IN_PROGRESS
      : REG_STATUS_DECLARED
  )

  const practitioner = await getLoggedInPractitionerResource(token)
  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  if (!isEventNotification(fhirBundle)) {
    /* setting lastRegLocation here */
    await setupLastRegLocation(taskResource, practitioner)
  }

  /* setting author and time on notes here */
  setupAuthorOnNotes(taskResource, practitioner)

  return fhirBundle
}

export async function markBundleAsValidated(
  bundle: fhir.Bundle & fhir.BundleEntry,
  token: string
): Promise<fhir.Bundle & fhir.BundleEntry> {
  const taskResource = getTaskResource(bundle) as fhir.Task

  const practitioner = await getLoggedInPractitionerResource(token)

  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    REG_STATUS_VALIDATED
  )

  await setupLastRegLocation(taskResource, practitioner)

  setupLastRegUser(taskResource, practitioner)

  return bundle
}

export async function markBundleAsRequestedForCorrection(
  bundle: fhir.Bundle & fhir.BundleEntry,
  token: string
): Promise<fhir.Bundle & fhir.BundleEntry> {
  const taskResource = getTaskResource(bundle) as fhir.Task

  const practitioner = await getLoggedInPractitionerResource(token)

  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    REG_STATUS_REQUESTED_CORRECTION
  )

  await setupLastRegLocation(taskResource, practitioner)

  setupLastRegUser(taskResource, practitioner)

  return bundle
}

export async function invokeRegistrationValidation(
  bundle: fhir.Bundle,
  token: string
) {
  try {
    fetch(`${RESOURCE_SERVICE_URL}validate/registration`, {
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
  const taskResource = getTaskResource(bundle) as fhir.Task

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    REG_STATUS_WAITING_VALIDATION
  )

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

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
    REG_STATUS_REGISTERED
  )

  return taskResource
}

export async function markBundleAsCertified(
  bundle: fhir.Bundle,
  token: string
): Promise<fhir.Bundle> {
  const taskResource = getTaskResource(bundle) as fhir.Task

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting registration workflow status here */
  await setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    REG_STATUS_CERTIFIED
  )

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

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
    regStatusCode.code === REG_STATUS_CERTIFIED
  ) {
    return
  }
  const existingTaskResource: fhir.Task = await getFromFhir(
    `/Task/${taskResource.id}`
  )
  const existingRegStatusCode =
    existingTaskResource &&
    existingTaskResource.businessStatus &&
    existingTaskResource.businessStatus.coding &&
    existingTaskResource.businessStatus.coding.find((code) => {
      return code.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
    })
  if (existingRegStatusCode && existingRegStatusCode.code === regStatusCode) {
    logger.error(`Application is already in ${regStatusCode} state`)
    throw new Error(`Application is already in ${regStatusCode} state`)
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
