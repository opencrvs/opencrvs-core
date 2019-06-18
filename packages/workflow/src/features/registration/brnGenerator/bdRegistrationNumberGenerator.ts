import { getTrackingIdFromTaskResource } from '@workflow/features/registration/fhir/fhir-utils'
import {
  getPractitionerLocations,
  getJurisDictionalLocations
} from '@workflow/features/user/utils'
import { OPENCRVS_SPECIFICATION_URL } from '@workflow/features/registration/fhir/constants'
import * as Verhoeff from 'node-verhoeff'
import { convertStringToASCII } from '@workflow/features/registration/utils'

export async function generateBdRegistrationNumber(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner
): Promise<string> {
  /* adding current year */
  let brn = new Date().getFullYear().toString()

  /* appending BBS code for district & upozila & union */
  brn = brn.concat((await getLocationBBSCode(practitioner)) as string)

  const trackingId = getTrackingIdFromTaskResource(taskResource) as string
  /* appending ascii converted tracking id */
  const brnToGenerateChecksum = brn.concat(convertStringToASCII(trackingId))
  /* appending tracking id */
  brn = brn.concat(trackingId)

  /* appending single verhoeff checksum digit */
  brn = brn.concat(Verhoeff.generate(brnToGenerateChecksum) as string)

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
          isTypeMatched(
            jurisDictionalLocation.jurisdictionType,
            identifier.value
          )
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

function isTypeMatched(matchType: string, inputType?: string): boolean {
  if (!inputType) {
    return false
  } else {
    return inputType.toUpperCase() === matchType.toUpperCase()
  }
}
