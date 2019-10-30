import {
  getPractitionerLocations,
  getJurisDictionalLocations,
  getPractitionerLocationId,
  convertNumberToString,
  OPENCRVS_SPECIFICATION_URL
} from '@resources/bgd/features/utils'
import { getNextLocationWiseSeqNumber } from '@resources/bgd/features/generate/sequenceNumbers/service'

export async function generateRegistrationNumber(
  practionerId: string
): Promise<string> {
  /* adding current year */
  let brn = new Date().getFullYear().toString()
  /* appending BBS code for district & upozila & union */
  brn = brn.concat((await getLocationBBSCode(practionerId)) as string)

  /* appending six digit location wise sequence number */
  brn = brn.concat(
    await getLocationWiseSeqNumber(
      await getPractitionerLocationId(practionerId)
    )
  )
  return brn
}

async function getLocationBBSCode(practionerId: string): Promise<string> {
  /* getting location list for logged in practitioner */
  if (!practionerId) {
    throw new Error('Invalid practioner data found')
  }

  const locations = await getPractitionerLocations(practionerId)

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

async function getLocationWiseSeqNumber(locationId: string): Promise<string> {
  const nextSeqNumber = await getNextLocationWiseSeqNumber(locationId)
  return convertNumberToString(nextSeqNumber.lastUsedSequenceNumber, 6)
}
