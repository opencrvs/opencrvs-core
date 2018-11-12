import { generateBirthTrackingId } from '../utils'
import { selectOrCreateTaskRefResource } from './fhir-utils'

export function pushTrackingId(fhirBundle: fhir.Bundle): fhir.Bundle {
  const birthTrackingId = generateBirthTrackingId()
  if (!fhirBundle || !fhirBundle.entry || !fhirBundle.entry[0].resource) {
    throw new Error('Invalid FHIR bundle found for declration')
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
  const taskResource = selectOrCreateTaskRefResource(fhirBundle)
  if (!taskResource.focus) {
    taskResource.focus = { reference: '' }
  }
  taskResource.focus.reference = `Composition/${birthTrackingId}`
  if (!taskResource.identifier) {
    taskResource.identifier = []
  }
  taskResource.identifier.push({
    system: 'http://opencrvs.org/specs/id/birth-tracking-id',
    value: birthTrackingId
  })

  return fhirBundle
}
