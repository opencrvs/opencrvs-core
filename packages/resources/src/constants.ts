export const AUTH_HOST = process.env.AUTH_HOST || 'localhost'
export const AUTH_PORT = process.env.AUTH_PORT || 2030
export const ADMINISTRATIVE_STRUCTURE_URL =
  process.env.ADMINISTRATIVE_STRUCTURE_URL || 'http://174.136.37.245:8090/gen'
export const ADMIN_STRUCTURE_SOURCE = `${process.cwd()}/src/features/administrative/generated/bn/`
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:5001/fhir'
export const ORG_URL = 'http://opencrvs.org'
