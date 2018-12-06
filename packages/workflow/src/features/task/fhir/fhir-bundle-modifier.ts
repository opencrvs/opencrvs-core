import { getLoggedInPractitionerResource } from 'src/features/user/utils'
import { setupAuthorOnNotes } from 'src/features/registration/fhir/fhir-bundle-modifier'
import { getTaskResource } from 'src/features/registration/fhir/fhir-template'

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

  const practitioner = await getLoggedInPractitionerResource(token)

  /* setting author and time on notes here */
  setupAuthorOnNotes(getTaskResource(fhirBundle) as fhir.Task, practitioner)
  return fhirBundle
}
