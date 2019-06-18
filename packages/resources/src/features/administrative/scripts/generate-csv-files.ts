import { Parser } from 'json2csv'
import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '@resources/constants'

interface IStats {
  OpenCRVS_ID: string
  Type: string
  English_name: string
  Bengali_name: string
  Bureau_of_Statistics_ID: string
  Map_data_exists: boolean
  OISF_A2I_Reference: string
  Rural_or_Urban: string
  Estimated_Male_Population: number
  Estimated_Female_Population: number
  Estimated_number_of_male_children_aged_10_years: number
  Estimated_number_of_female_children_aged_10_years: number
  Estimated_number_of_male_children_aged_9_years: number
  Estimated_number_of_female_children_aged_9_years: number
  Estimated_number_of_male_children_aged_8_years: number
  Estimated_number_of_female_children_aged_8_years: number
  Estimated_number_of_male_children_aged_7_years: number
  Estimated_number_of_female_children_aged_7_years: number
  Estimated_number_of_male_children_aged_6_years: number
  Estimated_number_of_female_children_aged_6_years: number
  Estimated_number_of_male_children_aged_5_years: number
  Estimated_number_of_female_children_aged_5_years: number
  Estimated_number_of_male_children_aged_4_years: number
  Estimated_number_of_female_children_aged_4_years: number
  Estimated_number_of_male_children_aged_3_years: number
  Estimated_number_of_female_children_aged_3_years: number
  Estimated_number_of_male_children_aged_2_years: number
  Estimated_number_of_female_children_aged_2_years: number
  Estimated_number_of_male_children_aged_1_years: number
  Estimated_number_of_female_children_aged_1_years: number
  Estimated_number_of_male_children_aged_under_6_months: number
  Estimated_number_of_female_children_aged_under_6_months: number
}

const fields = [
  'OpenCRVS_ID',
  'Type',
  'English_name',
  'Bengali_name',
  'Bureau_of_Statistics_ID',
  'Map_data_exists',
  'OISF_A2I_Reference',
  'Rural_or_Urban',
  'Estimated_Male_Population',
  'Estimated_Female_Population',
  'Estimated_number_of_male_children_aged_10_years',
  'Estimated_number_of_female_children_aged_10_years',
  'Estimated_number_of_male_children_aged_9_years',
  'Estimated_number_of_female_children_aged_9_years',
  'Estimated_number_of_male_children_aged_8_years',
  'Estimated_number_of_female_children_aged_8_years',
  'Estimated_number_of_male_children_aged_7_years',
  'Estimated_number_of_female_children_aged_7_years',
  'Estimated_number_of_male_children_aged_6_years',
  'Estimated_number_of_female_children_aged_6_years',
  'Estimated_number_of_male_children_aged_5_years',
  'Estimated_number_of_female_children_aged_5_years',
  'Estimated_number_of_male_children_aged_4_years',
  'Estimated_number_of_female_children_aged_4_years',
  'Estimated_number_of_male_children_aged_3_years',
  'Estimated_number_of_female_children_aged_3_years',
  'Estimated_number_of_male_children_aged_2_years',
  'Estimated_number_of_female_children_aged_2_years',
  'Estimated_number_of_male_children_aged_1_years',
  'Estimated_number_of_female_children_aged_1_years',
  'Estimated_number_of_male_children_aged_under_6_months',
  'Estimated_number_of_female_children_aged_under_6_months'
]

function buildLocationStats(
  fhirLocations: fhir.Location[],
  type: string
): IStats[] {
  const locationStats: IStats[] = []
  fhirLocations.map((location: fhir.Location) => {
    const identifier = location.identifier as fhir.Identifier
    const alias = location.alias as string[]
    const entry: IStats = {
      OpenCRVS_ID: location.id as string,
      Type: type,
      English_name: location.name as string,
      Bengali_name: alias[0] as string,
      Bureau_of_Statistics_ID: identifier[0].value,
      Map_data_exists: false,
      OISF_A2I_Reference: location.description as string,
      Rural_or_Urban: '',
      Estimated_Male_Population: 0,
      Estimated_Female_Population: 0,
      Estimated_number_of_male_children_aged_10_years: 0,
      Estimated_number_of_female_children_aged_10_years: 0,
      Estimated_number_of_male_children_aged_9_years: 0,
      Estimated_number_of_female_children_aged_9_years: 0,
      Estimated_number_of_male_children_aged_8_years: 0,
      Estimated_number_of_female_children_aged_8_years: 0,
      Estimated_number_of_male_children_aged_7_years: 0,
      Estimated_number_of_female_children_aged_7_years: 0,
      Estimated_number_of_male_children_aged_6_years: 0,
      Estimated_number_of_female_children_aged_6_years: 0,
      Estimated_number_of_male_children_aged_5_years: 0,
      Estimated_number_of_female_children_aged_5_years: 0,
      Estimated_number_of_male_children_aged_4_years: 0,
      Estimated_number_of_female_children_aged_4_years: 0,
      Estimated_number_of_male_children_aged_3_years: 0,
      Estimated_number_of_female_children_aged_3_years: 0,
      Estimated_number_of_male_children_aged_2_years: 0,
      Estimated_number_of_female_children_aged_2_years: 0,
      Estimated_number_of_male_children_aged_1_years: 0,
      Estimated_number_of_female_children_aged_1_years: 0,
      Estimated_number_of_male_children_aged_under_6_months: 0,
      Estimated_number_of_female_children_aged_under_6_months: 0
    }
    locationStats.push(entry)
  })
  return locationStats
}

const json2csvParser = new Parser({ fields })

const divisionsJSON = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/divisions.json`)
    .toString()
)
const divisionsCSV = json2csvParser.parse(
  buildLocationStats(divisionsJSON.divisions, 'Division')
)
fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/divisions.csv`,
  divisionsCSV
)

const districtsJSON = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/districts.json`)
    .toString()
)
const districtsCSV = json2csvParser.parse(
  buildLocationStats(districtsJSON.districts, 'District')
)
fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/districts.csv`,
  districtsCSV
)

const upazilasJSON = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
)
const upazilasCSV = json2csvParser.parse(
  buildLocationStats(upazilasJSON.upazilas, 'Upazila')
)
fs.writeFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.csv`, upazilasCSV)

const citiesJSON = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/cities.json`).toString()
)
const citiesCSV = json2csvParser.parse(
  buildLocationStats(citiesJSON.cities, 'City Corporation')
)
fs.writeFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/cities.csv`, citiesCSV)

const cityWardsJSON = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/cityWards.json`)
    .toString()
)
const cityWardsCSV = json2csvParser.parse(
  buildLocationStats(cityWardsJSON.cityWards, 'City Wards')
)
fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/cityWards.csv`,
  cityWardsCSV
)

const municipalitiesJSON = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/municipalities.json`)
    .toString()
)
const municipalitiesCSV = json2csvParser.parse(
  buildLocationStats(municipalitiesJSON.municipalities, 'Municipality')
)
fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/municipalities.csv`,
  municipalitiesCSV
)

const municipalityWardsJSON = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/municipalityWards.json`)
    .toString()
)
const municipalityWardsCSV = json2csvParser.parse(
  buildLocationStats(
    municipalityWardsJSON.municipalityWards,
    'Municipality Ward'
  )
)
fs.writeFileSync(
  `${ADMIN_STRUCTURE_SOURCE}locations/municipalityWards.csv`,
  municipalityWardsCSV
)

const thanasJSON = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/thanas.json`).toString()
)
const thanasCSV = json2csvParser.parse(
  buildLocationStats(thanasJSON.thanas, 'Thana')
)
fs.writeFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/thanas.csv`, thanasCSV)

const unionsJSON = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.json`).toString()
)
const unionsCSV = json2csvParser.parse(
  buildLocationStats(unionsJSON.unions, 'Union')
)
fs.writeFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.csv`, unionsCSV)
