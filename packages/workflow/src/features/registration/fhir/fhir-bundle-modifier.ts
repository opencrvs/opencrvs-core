import { generateBirthTrackingId } from '../utils'
import { getRegStatusCode } from './fhir-utils'
import { selectOrCreateTaskRefResource } from './fhir-template'
import { OPENCRVS_SPECIFICATION_URL, EVENT_TYPE } from './constants'
import { ITokenPayload, getTokenPayload } from 'src/utils/authUtils.ts'

export function modifyBirthRegistrationBundle(
  fhirBundle: fhir.Bundle,
  eventType: EVENT_TYPE,
  token: string
): fhir.Bundle {
  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }

  /* setting unique trackingid here */
  fhirBundle = pushTrackingId(fhirBundle)

  /* setting registration type here */
  fhirBundle = setupRegistrationType(fhirBundle, eventType)

  const tokenPayload = getTokenPayload(token)

  /* setting registration workflow status here */
  fhirBundle = setupRegistrationWorkflow(fhirBundle, tokenPayload)

  /* setting lastRegUser here */
  fhirBundle = setupLastRegUser(fhirBundle, tokenPayload)

  /* setting author and time on notes here */
  fhirBundle = setupAuthorOnNotes(fhirBundle, tokenPayload)

  return fhirBundle
}

export function pushTrackingId(fhirBundle: fhir.Bundle): fhir.Bundle {
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
  if (!taskResource.focus) {
    taskResource.focus = { reference: '' }
  }
  taskResource.focus.reference = `Composition/${birthTrackingId}`
  if (!taskResource.identifier) {
    taskResource.identifier = []
  }
  taskResource.identifier.push({
    system: `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
    value: birthTrackingId
  })

  return fhirBundle
}

export function setupRegistrationType(
  fhirBundle: fhir.Bundle,
  eventType: EVENT_TYPE
): fhir.Bundle {
  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task

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
  return fhirBundle
}

export function setupRegistrationWorkflow(
  fhirBundle: fhir.Bundle,
  tokenpayload: ITokenPayload
): fhir.Bundle {
  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task

  const regStatusCodeString = getRegStatusCode(tokenpayload)

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
  return fhirBundle
}

export function setupLastRegUser(
  fhirBundle: fhir.Bundle,
  tokenPayload: ITokenPayload
): fhir.Bundle {
  // TODO: need to change it as soon as we have decided the approach
  if (!tokenPayload || !tokenPayload.subject) {
    tokenPayload.subject = 'DUMMY'
  }

  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task

  if (!taskResource.extension) {
    taskResource.extension = []
  }
  const regUserExtension = taskResource.extension.find(extension => {
    return (
      extension.url === `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`
    )
  })
  if (regUserExtension) {
    regUserExtension.valueString = tokenPayload.subject
  } else {
    taskResource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
      valueString: tokenPayload.subject
    })
  }
  return fhirBundle
}

export function setupAuthorOnNotes(
  fhirBundle: fhir.Bundle,
  tokenPayload: ITokenPayload
): fhir.Bundle {
  // TODO: need to change it as soon as we have decided the approach
  if (!tokenPayload || !tokenPayload.subject) {
    tokenPayload.subject = 'DUMMY'
  }

  const taskResource = selectOrCreateTaskRefResource(fhirBundle) as fhir.Task

  if (!taskResource.note) {
    return fhirBundle
  }
  taskResource.note.forEach(note => {
    if (!note.authorString) {
      note.authorString = tokenPayload.subject
    }
  })

  return fhirBundle
}
