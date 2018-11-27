import { ITokenPayload } from 'src/utils/authUtils.ts'
import { getTrackingId } from '../fhir/fhir-utils'
import * as Verhoeff from 'node-verhoeff'

export function generateBdBRN(
  fhirBundle: fhir.Bundle,
  tokenPayload: ITokenPayload
): string {
  /* adding current year */
  let brn = new Date().getFullYear().toString()

  /* appending BBS code for district */

  /* appending BBS code for upozila */

  /* appending BBS code for union */

  /* appending application tracking id */
  brn = brn.concat(getTrackingId(fhirBundle) as string)

  /* appending single verhoeff checksum digit */
  brn = brn.concat(Verhoeff.generate([4]) as string)

  return brn
}
