/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  getPractitionerLocations,
  getJurisDictionalLocations,
  convertStringToASCII,
  OPENCRVS_SPECIFICATION_URL
} from '@resources/bgd/features/utils'
import * as Verhoeff from 'node-verhoeff'

export async function generateRegistrationNumber(
  trackingId: string,
  practionerId: string
): Promise<string> {
  /* adding current year */
  let brn = new Date().getFullYear().toString()
  /* appending BBS code for district & upozila & union */
  brn = brn.concat((await getLocationBBSCode(practionerId)) as string)

  /* appending ascii converted tracking id */
  const brnToGenerateChecksum = brn.concat(convertStringToASCII(trackingId))
  /* appending tracking id */
  brn = brn.concat(trackingId)

  /* appending single verhoeff checksum digit */
  brn = brn.concat(Verhoeff.generate(brnToGenerateChecksum) as string)

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
