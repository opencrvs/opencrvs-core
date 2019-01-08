export const ADMINISTRATIVE_STRUCTURE_URL =
  process.env.ADMINISTRATIVE_STRUCTURE_URL || 'http://174.136.37.245:8090/gen'
export const ADMIN_STRUCTURE_SOURCE = `${process.cwd()}/src/features/administrative/generated/bn/`
export const GEO_JSON_SOURCE = `${process.cwd()}/src/features/administrative/scripts/geojson/bn/`
export const FACILITIES_SOURCE = `${process.cwd()}/src/features/facilities/generated/bn/`
export const EMPLOYEES_SOURCE = `${process.cwd()}/src/features/employees/generated/bn/`
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'
export const ORG_URL = 'http://opencrvs.org'
export const REGISTER_SOURCE = `${process.cwd()}/../register/public/assets/`
