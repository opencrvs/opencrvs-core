export const HOST = process.env.HOST || 'localhost'
export const PORT = process.env.PORT || 3030
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost/user-mgnt'

export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'

export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'

export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:5001/fhir'
