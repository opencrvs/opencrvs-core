import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '../../../constants'

const divisionsWithoutGeo = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/divisions.json`)
    .toString()
)

const districtsWithoutGeo = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/districts.json`)
    .toString()
)

const admin1Geo = JSON.parse(
  fs
    .readFileSync(
      `${ADMIN_STRUCTURE_SOURCE}locations/bgd_admbnda_adm1_bbs_20180410_generalized.geojson`
    )
    .toString()
)

const admin2Geo = JSON.parse(
  fs
    .readFileSync(
      `${ADMIN_STRUCTURE_SOURCE}locations/bgd_admbnda_adm2_bbs_20180410_generalized.geojson`
    )
    .toString()
)

function matchAndAssignGeoData(fhirLocations: any, features: any) {
  return fhirLocations.map((location: any) => {
    const matchingFeature = features.find(
      (feature: any) =>
        feature.properties.Name.trim().toLowerCase() ===
        location.name.trim().toLowerCase()
    )

    if (!matchingFeature) {
      throw new Error(`No match for ${location.name}`)
    }

    location.extension[0].valueAttachment.data = Buffer.from(
      JSON.stringify(matchingFeature)
    ).toString('base64')

    return location
  })
}

const mapGeo = {
  divisions: matchAndAssignGeoData(
    divisionsWithoutGeo.divisions,
    admin1Geo.features
  ),
  districts: matchAndAssignGeoData(
    districtsWithoutGeo.districts,
    admin2Geo.features
  )
}

fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/map-geo.json`,
  JSON.stringify(mapGeo, null, 2)
)
