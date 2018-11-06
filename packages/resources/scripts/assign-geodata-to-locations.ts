import * as fs from 'fs'

const locations = JSON.parse(fs.readFileSync('map.json').toString())

const admin1Geo = JSON.parse(
  fs
    .readFileSync('bgd_admbnda_adm1_bbs_20180410_generalized.geojson')
    .toString()
)

const admin2Geo = JSON.parse(
  fs
    .readFileSync('bgd_admbnda_adm2_bbs_20180410_generalized.geojson')
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
  divisions: matchAndAssignGeoData(locations.divisions, admin1Geo.features),
  districts: matchAndAssignGeoData(locations.districts, admin2Geo.features)
}

fs.writeFileSync('map-geo.json', JSON.stringify(mapGeo, null, 2))
