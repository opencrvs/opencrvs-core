import { generateBirthTrackingId } from '../utils'
import { selectOrCreateTaskRefResource } from './fhir-template'
import { OPENCRVS_SPECIFICATION_URL } from './constants'

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
