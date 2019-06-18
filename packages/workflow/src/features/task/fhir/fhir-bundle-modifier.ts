import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import {
  setupLastRegUser,
  setupLastRegLocation,
  setupAuthorOnNotes
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { getTaskResource } from '@workflow/features/registration/fhir/fhir-template'

export async function modifyTaskBundle(
  fhirBundle: fhir.Bundle,
  token: string
): Promise<fhir.Bundle> {
  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found for task')
  }
  const taskResource = getTaskResource(fhirBundle) as fhir.Task
  const practitioner = await getLoggedInPractitionerResource(token)
  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting author and time on notes here */
  setupAuthorOnNotes(taskResource, practitioner)

  return fhirBundle
}
