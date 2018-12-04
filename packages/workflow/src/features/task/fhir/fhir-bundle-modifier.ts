import { getTokenPayload } from 'src/utils/authUtils.ts'
import { setupAuthorOnNotes } from 'src/features/registration/fhir/fhir-bundle-modifier'

export function modifyTaskBundle(
  fhirBundle: fhir.Bundle,
  token: string
): fhir.Bundle {
  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found for task')
  }

  const tokenPayload = getTokenPayload(token)

  /* setting author and time on notes here */
  fhirBundle = setupAuthorOnNotes(fhirBundle, tokenPayload)
  return fhirBundle
}
