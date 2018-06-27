export const AUTH_HOST = process.env.AUTH_HOST || 'localhost'
export const AUTH_PORT = process.env.AUTH_PORT || 3030
export const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/test'

export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
