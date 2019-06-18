import {
  generateBirthTrackingId,
  generateDeathTrackingId,
  getEventType
} from '@workflow/features/registration/utils'
import { getRegStatusCode } from '@workflow/features/registration/fhir/fhir-utils'
import {
  getLoggedInPractitionerResource,
  getPractitionerPrimaryLocation,
  getPractitionerUnionLocation,
  getPractitionerRef
} from '@workflow/features/user/utils'
import {
  selectOrCreateTaskRefResource,
  getTaskResource
} from '@workflow/features/registration/fhir/fhir-template'
import {
  OPENCRVS_SPECIFICATION_URL,
  EVENT_TYPE,
  REG_STATUS_DECLARED,
  REG_STATUS_REGISTERED,
  REG_STATUS_CERTIFIED
} from '@workflow/features/registration/fhir/constants'
import { ITokenPayload, getTokenPayload } from '@workflow/utils/authUtils.ts'
import { generateRegistrationNumber } from '@workflow/features/registration/brnGenerator'

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
  setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    REG_STATUS_DECLARED
  )

  const practitioner = await getLoggedInPractitionerResource(token)
  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting author and time on notes here */
  setupAuthorOnNotes(taskResource, practitioner)

  return fhirBundle
}

export async function markBundleAsRegistered(
  bundle: fhir.Bundle & fhir.BundleEntry,
  token: string
): Promise<fhir.Bundle & fhir.BundleEntry> {
  const taskResource = getTaskResource(bundle) as fhir.Task

  const practitioner = await getLoggedInPractitionerResource(token)

  /* Setting registration number here */
  const eventType = getEventType(bundle)
  if (eventType === EVENT_TYPE.BIRTH) {
    await pushRN(taskResource, practitioner, 'birth-registration-number')
  } else if (eventType === EVENT_TYPE.DEATH) {
    await pushRN(taskResource, practitioner, 'death-registration-number')
  }

  /* setting registration workflow status here */
  setupRegistrationWorkflow(
    taskResource,
    getTokenPayload(token),
    REG_STATUS_REGISTERED
  )

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  return bundle
}

export async function markBundleAsCertified(
  bundle: fhir.Bundle,
  token: string
): Promise<fhir.Bundle> {
  const taskResource = getTaskResource(bundle) as fhir.Task

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting registration workflow status here */
  setupRegistrationWorkflow(
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

export async function pushRN(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner,
  identifierName: string
): Promise<fhir.Task> {
  if (!taskResource) {
    throw new Error('Invalid Task resource found for registration')
  }

  const brn = await generateRegistrationNumber(taskResource, practitioner)

  if (!taskResource.identifier) {
    taskResource.identifier = []
  }
  const brnIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find(identifier => {
      return (
        identifier.system ===
        `${OPENCRVS_SPECIFICATION_URL}id/${identifierName}`
      )
    })
  if (!brnIdentifier) {
    taskResource.identifier.push({
      system: `${OPENCRVS_SPECIFICATION_URL}id/${identifierName}`,
      value: brn
    })
  } else {
    brnIdentifier.value = brn
  }
  return taskResource
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
    identifier =>
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

export function setupRegistrationWorkflow(
  taskResource: fhir.Task,
  tokenpayload: ITokenPayload,
  defaultStatus?: string
): fhir.Task {
  const regStatusCodeString = defaultStatus
    ? defaultStatus
    : getRegStatusCode(tokenpayload)

  if (!taskResource.businessStatus) {
    taskResource.businessStatus = {}
  }
  if (!taskResource.businessStatus.coding) {
    taskResource.businessStatus.coding = []
  }
  const regStatusCode = taskResource.businessStatus.coding.find(code => {
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
  return taskResource
}

export async function setupLastRegLocation(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner
): Promise<fhir.Task> {
  if (!practitioner || !practitioner.id) {
    throw new Error('Invalid practitioner data found')
  }
  const union = await getPractitionerUnionLocation(practitioner.id)
  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const regUserLastLocationExtension = taskResource.extension.find(
    extension => {
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
    regUserLastLocationExtension.valueReference.reference = `Location/${union.id}`
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
      valueReference: { reference: `Location/${union.id}` }
    })
  }

  const primaryOffice = await getPractitionerPrimaryLocation(practitioner.id)

  const regUserLastOfficeExtension = taskResource.extension.find(extension => {
    return (
      extension.url === `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`
    )
  })
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
  const regUserExtension = taskResource.extension.find(extension => {
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
  taskResource.lastModified = new Date().toISOString()
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
  taskResource.note.forEach(note => {
    if (!note.authorString) {
      note.authorString = authorName
    }
  })
  return taskResource
}
