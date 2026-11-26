/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { readCSVToJSON } from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'

type HumdataLocation = {
  admin0Pcode: string
  admin0Name_en: string

  admin1Pcode?: string
  admin1Name_en?: string

  admin2Pcode?: string
  admin2Name_en?: string

  admin3Pcode?: string
  admin3Name_en?: string

  admin4Pcode?: string
  admin4Name_en?: string
}

type AdministrativeArea = {
  id: string
  name: string
  partOf: string
}

type Location = {
  id: string
  name: string
  partOf: string
  locationType: string
}

export async function locationsHandler(_: Request, h: ResponseToolkit) {
  const [humdataLocations, locations] = await Promise.all([
    readCSVToJSON<HumdataLocation[]>(
      './src/data-seeding/locations/source/administrative-areas.csv'
    ),
    readCSVToJSON<Location[]>(
      './src/data-seeding/locations/source/locations.csv'
    )
  ])
  const administrativeAreas = new Map<string, AdministrativeArea>()
  humdataLocations.forEach((humdataLocation) => {
    ;([1, 2, 3, 4] as const).forEach((locationLevel) => {
      const id = humdataLocation[`admin${locationLevel}Pcode`]
      if (id) {
        const nonEmptyLevels = ([1, 2, 3, 4] as const)
          .slice(0, locationLevel)
          .filter((l) => humdataLocation[`admin${l}Pcode`])
        const depth = nonEmptyLevels.length
        const parentPcode = nonEmptyLevels[depth - 2]
        const partOf = parentPcode
          ? `Location/${humdataLocation[`admin${parentPcode}Pcode`]}`
          : 'Location/0'

        administrativeAreas.set(id, {
          id,
          name: humdataLocation[`admin${locationLevel}Name_en`]!,
          partOf
        })
      }
    })
  })
  return h.response({
    administrativeAreas: Array.from(administrativeAreas.values()),
    locations
  })
}
