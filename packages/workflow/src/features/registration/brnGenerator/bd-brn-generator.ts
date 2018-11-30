import { getPaperFormID } from '../fhir/fhir-utils'
import {
  getPractitionerLocations,
  getJurisDictionalLocations
} from 'src/features/user/utils'
import { OPENCRVS_SPECIFICATION_URL } from '../fhir/constants'
import * as Verhoeff from 'node-verhoeff'

export async function generateBdBRN(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner
): Promise<string> {
  /* adding current year */
  let brn = new Date().getFullYear().toString()

  /* appending BBS code for district & upozila & union */
  brn = brn.concat((await getLocationBBSCode(practitioner)) as string)

  /* appending paper form id */
  brn = brn.concat(getPaperFormID(taskResource) as string)

  /* appending single verhoeff checksum digit */
  brn = brn.concat(Verhoeff.generate(brn) as string)

  return brn
}

export async function getLocationBBSCode(
  practitioner: fhir.Practitioner
): Promise<string> {
  /* getting location list for logged in practitioner */
  if (!practitioner || !practitioner.id) {
    throw new Error('Invalid practioner data found')
  }
  const locations = await getPractitionerLocations(practitioner.id)

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
