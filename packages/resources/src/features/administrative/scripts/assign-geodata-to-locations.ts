import * as fs from 'fs'
import chalk from 'chalk'
import { ADMIN_STRUCTURE_SOURCE, GEO_JSON_SOURCE } from '@resources/constants'
import { checkDuplicate, getFromFhir } from '@resources/features/utils/bn'
import { Feature, GeoJsonProperties } from 'geojson'

// tslint:disable-next-line:no-console
console.log(
  `${chalk.blueBright(
    '/////////////////////////// ASSIGNING MAP DATA TO LOCATIONS ///////////////////////////'
  )}`
)

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
      `${GEO_JSON_SOURCE}bgd_admbnda_adm1_bbs_20180410_generalized.geojson`
    )
    .toString()
)

const admin2Geo = JSON.parse(
  fs
    .readFileSync(
      `${GEO_JSON_SOURCE}bgd_admbnda_adm2_bbs_20180410_generalized.geojson`
    )
    .toString()
)

const admin3Geo = JSON.parse(
  fs
    .readFileSync(
      `${GEO_JSON_SOURCE}bgd_admbnda_adm3_bbs_20180410_generalized.geojson`
    )
    .toString()
)

async function getParentName(location: fhir.Location): Promise<string> {
  const partOf = location.partOf as fhir.Reference
  const reference = partOf.reference as string
  const splitRef = reference.split('/')
  const parentResponse = await getFromFhir(`/Location/${splitRef[1]}`)
  return parentResponse.name
}

async function matchAndAssignGeoData(
  fhirLocations: fhir.Location[],
  features: Feature[],
  label: string
) {
  // tslint:disable-next-line:no-console
  console.log(`Parsing Geo Data for ${label}`)
  const containsDuplicate = checkDuplicate('name', fhirLocations)
  const mappedLocations: fhir.Location[] = []

  for (const location of fhirLocations) {
    let matchingFeature
    const locationName = location.name as string
    if (!containsDuplicate) {
      matchingFeature = features.find((feature: Feature) => {
        const geoProps = feature.properties as GeoJsonProperties
        if (!geoProps) {
          throw Error('Map contains no geometry')
        }
        return (
          geoProps.Name.trim().toLowerCase() ===
          locationName.trim().toLowerCase()
        )
      })
    } else {
      const parentLocationName = await getParentName(location)

      matchingFeature = features.find((feature: Feature) => {
        const geoProps = feature.properties as GeoJsonProperties
        if (!geoProps) {
          throw Error('Map contains no geometry')
        }
        return (
          geoProps.ADM2_EN.trim().toLowerCase() ===
            parentLocationName.toLowerCase() &&
          geoProps.Name.trim().toLowerCase() ===
            locationName.trim().toLowerCase()
        )
      })
    }

    if (!matchingFeature) {
      // tslint:disable-next-line:no-console
      console.log(
        `${chalk.red(
          'Warning:'
        )} No map can be found that confidently matches: ${location.name}`
      )
    } else {
      const extensions = location.extension as fhir.Extension[]
      const mapDataExtension = extensions[0] as fhir.Extension
      const valueAttachment = mapDataExtension.valueAttachment as fhir.Attachment
      valueAttachment.data = Buffer.from(
        JSON.stringify(matchingFeature)
      ).toString('base64')

      mappedLocations.push(location)
    }
  }
  return mappedLocations
}

export default async function saveGeoData() {
  const mapGeo = {
    divisions: await matchAndAssignGeoData(
      divisionsWithoutGeo.divisions,
      admin1Geo.features,
      'divisions'
    ),
    districts: await matchAndAssignGeoData(
      districtsWithoutGeo.districts,
      admin2Geo.features,
      'districts'
    ),
    upazilas: await matchAndAssignGeoData(
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
}

saveGeoData()
