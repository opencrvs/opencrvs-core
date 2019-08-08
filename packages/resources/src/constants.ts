export const TEST_SOURCE = `${process.cwd()}/src/tests/`
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'
export const ORG_URL = 'http://opencrvs.org'
export const RESOURCES_HOST = process.env.RESOURCES_HOST || '0.0.0.0'
export const RESOURCES_PORT = process.env.RESOURCES_PORT || 3040
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
