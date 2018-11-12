import * as fs from 'fs'
import chalk from 'chalk'
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

const upazilasWithoutGeo = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
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

const admin3Geo = JSON.parse(
  fs
    .readFileSync(
      `${ADMIN_STRUCTURE_SOURCE}locations/bgd_admbnda_adm3_bbs_20180410_generalized.geojson`
    )
    .toString()
)

function matchAndAssignGeoData(
  fhirLocations: any,
  features: any,
  label: string
) {
  // tslint:disable-next-line:no-console
  console.log(`Parsing Geo Data for ${label}`)
  return fhirLocations.map((location: any) => {
    const matchingFeature = features.find(
      (feature: any) =>
        feature.properties.Name.trim().toLowerCase() ===
        location.name.trim().toLowerCase()
    )

    if (!matchingFeature) {
      // tslint:disable-next-line:no-console
      console.log(`${chalk.yellow('Warning:')} No match for ${location.name}`)
      return location
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
    admin1Geo.features,
    'divisions'
  ),
  districts: matchAndAssignGeoData(
    districtsWithoutGeo.districts,
    admin2Geo.features,
    'districts'
  ),
  upazilas: matchAndAssignGeoData(
    upazilasWithoutGeo.upazilas,
    admin3Geo.features,
    'upazilas'
  )
}

fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/divisions-geo.json`,
  JSON.stringify({ divisions: mapGeo.divisions }, null, 2)
)

fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/districts-geo.json`,
  JSON.stringify({ districts: mapGeo.districts }, null, 2)
)

fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/upazilas-geo.json`,
  JSON.stringify({ upazilas: mapGeo.upazilas }, null, 2)
)
