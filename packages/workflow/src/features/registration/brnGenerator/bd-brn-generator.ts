import { ITokenPayload } from 'src/utils/authUtils.ts'

export function generateBdBRN(
  fhirBundle: fhir.Bundle,
  tokenPayload: ITokenPayload
): string {
  return '20182011653473BTTTTTTTV'
}
