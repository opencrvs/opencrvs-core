import { generateBirthTrackingId } from '../utils'
import { getRegStatusCode } from './fhir-utils'
import {
  getLoggedInPractitionerResource,
  getPractitionerPrimaryLocation,
  getPractitionerRef
} from 'src/features/user/utils'
import { selectOrCreateTaskRefResource, getTaskResource } from './fhir-template'
import { OPENCRVS_SPECIFICATION_URL, EVENT_TYPE } from './constants'
import { ITokenPayload, getTokenPayload } from 'src/utils/authUtils.ts'
import { REG_STATUS_REGISTERED } from './constants'
import { generateBirthRegistrationNumber } from '../brnGenerator'

export async function modifyRegistrationBundle(
  fhirBundle: fhir.Bundle,
  eventType: EVENT_TYPE,
  token: string
): Promise<fhir.Bundle> {
  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }
  /* setting unique trackingid here */
  fhirBundle = setTrackingId(fhirBundle)

  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task
  /* setting registration type here */
  setupRegistrationType(taskResource, eventType)

  /* setting registration workflow status here */
  setupRegistrationWorkflow(taskResource, getTokenPayload(token))

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

  /* Setting birth registration number here */
  await pushBRN(taskResource, practitioner)

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

export async function pushBRN(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner
): Promise<fhir.Task> {
  if (!taskResource) {
    throw new Error('Invalid Task resource found for registration')
  }

  const brn = await generateBirthRegistrationNumber(taskResource, practitioner)

  if (!taskResource.identifier) {
    taskResource.identifier = []
  }
  const brnIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find(identifier => {
      return (
        identifier.system ===
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
    })
  if (!brnIdentifier) {
    taskResource.identifier.push({
      system: `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`,
      value: brn
    })
  } else {
    brnIdentifier.value = brn
  }
  return taskResource
}

export function setTrackingId(fhirBundle: fhir.Bundle): fhir.Bundle {
  const birthTrackingId = generateBirthTrackingId()

  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }

  const compositionResource = fhirBundle.entry[0].resource as fhir.Composition
  if (!compositionResource.identifier) {
    compositionResource.identifier = {
      system: 'urn:ietf:rfc:3986',
      value: birthTrackingId
    }
  } else {
    compositionResource.identifier.value = birthTrackingId
  }
  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task
  if (!taskResource.identifier) {
    taskResource.identifier = []
  }
  const existingTrackingId = taskResource.identifier.find(
    identifier =>
      identifier.system === `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`
  )

  if (existingTrackingId) {
    existingTrackingId.value = birthTrackingId
  } else {
    taskResource.identifier.push({
      system: `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
      value: birthTrackingId
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
  const primaryOffice = await getPractitionerPrimaryLocation(practitioner.id)

  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const regUserExtension = taskResource.extension.find(extension => {
    return (
      extension.url === `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`
    )
  })
  if (regUserExtension) {
    regUserExtension.valueReference = `Location/${
      primaryOffice.id
    }` as fhir.Reference
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
      valueReference: `Location/${primaryOffice.id}` as fhir.Reference
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
  if (regUserExtension) {
    regUserExtension.valueReference = getPractitionerRef(
      practitioner
    ) as fhir.Reference
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
      valueReference: getPractitionerRef(practitioner) as fhir.Reference
    })
  }
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
