import {
  getPaperFormID,
  getLoggedInPractitionerResource,
  getPractitionerLocations,
  getJurisDictionalLocations
} from '../fhir/fhir-utils'
import { OPENCRVS_SPECIFICATION_URL } from '../fhir/constants'
import * as Verhoeff from 'node-verhoeff'

export async function generateBdBRN(
  fhirBundle: fhir.Bundle,
  token: string
): Promise<string> {
  /* adding current year */
  let brn = new Date().getFullYear().toString()

  /* appending BBS code for district & upozila & union */
  brn = brn.concat((await getLocationBBSCode(token)) as string)

  /* appending paper form id */
  brn = brn.concat(getPaperFormID(fhirBundle) as string)

  /* appending single verhoeff checksum digit */
  brn = brn.concat(Verhoeff.generate(brn) as string)

  return brn
}

export async function getLocationBBSCode(token: string): Promise<string> {
  /* getting logged in practitioner */
  const practitionerResource = await getLoggedInPractitionerResource(token)

  if (!practitionerResource.id) {
    throw new Error("Practioner's ID not found")
  }
  /* getting location list for practitioner */
  const locations = await getPractitionerLocations(practitionerResource.id)

  const jurisDictionalLocations = getJurisDictionalLocations()
  for (const location of locations) {
    if (!location || !location.identifier) {
      continue
    }
    jurisDictionalLocations.forEach(jurisDictionalLocation => {
      if (jurisDictionalLocation.bbsCode !== '' || !location.identifier) {
        return
      }
      const jurisDictionIdentifier = location.identifier.find(
        identifier =>
          identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/jurisdiction-type` &&
          identifier.value === jurisDictionalLocation.jurisdictionType
      )
      const bbsCodeIdentifier =
        jurisDictionIdentifier &&
        location.identifier.find(
          identifier =>
            identifier.system === `${OPENCRVS_SPECIFICATION_URL}id/bbs-code`
        )
      if (bbsCodeIdentifier && bbsCodeIdentifier.value) {
        jurisDictionalLocation.bbsCode = bbsCodeIdentifier.value
      }
    })
  }

  return jurisDictionalLocations.reduce((locBBSCode, loc) => {
    return locBBSCode.concat(loc.bbsCode)
  }, '')
}
