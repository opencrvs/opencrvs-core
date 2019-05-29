export const ADMINISTRATIVE_STRUCTURE_URL =
  process.env.ADMINISTRATIVE_STRUCTURE_URL || 'http://174.136.37.245:8090/gen'
export const ADMIN_STRUCTURE_SOURCE = `${process.cwd()}/src/features/administrative/generated/bn/`
export const GEO_JSON_SOURCE = `${process.cwd()}/src/features/administrative/scripts/geojson/bn/`
export const FACILITIES_SOURCE = `${process.cwd()}/src/features/facilities/generated/bn/`
export const EMPLOYEES_SOURCE = `${process.cwd()}/src/features/employees/generated/bn/`
export const TEST_SOURCE = `${process.cwd()}/src/tests/`
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'
export const ORG_URL = 'http://opencrvs.org'
export const REGISTER_SOURCE = `${process.cwd()}/../register/public/assets/`
export const RESOURCES_HOST = process.env.RESOURCES_HOST || '0.0.0.0'
export const RESOURCES_PORT = process.env.RESOURCES_PORT || 3040
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
