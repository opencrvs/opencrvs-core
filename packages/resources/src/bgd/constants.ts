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
export const LANGUAGES_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/languages/generated/'
)
export const SEQUENCE_NUMBER_SOURCE = path.join(
  process.cwd(),
  'src/bgd/features/generate/sequenceNumbers/'
)
export const ADMINISTRATIVE_STRUCTURE_URL = 'http://174.136.37.245:8090/gen'
