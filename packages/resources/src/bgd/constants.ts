import * as path from 'path'

export const ADMIN_STRUCTURE_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/administrative/generated/'
)
export const GEO_JSON_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/administrative/scripts/geojson/'
)
export const FACILITIES_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/facilities/generated/'
)
export const EMPLOYEES_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/employees/generated/'
)
export const HRIS_FACILITIES_URL =
  process.env.HRIS_FACILITIES_URL ||
  'http://hris.mohfw.gov.bd/api/1.0/facilities/get'
export const HRIS_CLIENT_ID = process.env.HRIS_CLIENT_ID || ''
export const HRIS_TOKEN = process.env.HRIS_TOKEN || ''
export const LANGUAGES_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/languages/generated/'
)
export const SEQUENCE_NUMBER_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/generate/sequenceNumbers/'
)
export const ADMINISTRATIVE_STRUCTURE_URL = 'http://esb.beta.doptor.gov.bd:8280'
