export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const AUTH_HOST = process.env.AUTH_HOST || 'localhost'
export const AUTH_PORT = process.env.AUTH_PORT || 4040
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'

export const CLICKATELL_USER = process.env.CLICKATELL_USER
export const CLICKATELL_PASSWORD = process.env.CLICKATELL_PASSWORD
export const CLICKATELL_API_ID = process.env.CLICKATELL_API_ID

export const CERT_PRIVATE_KEY_PATH = process.env.CERT_PRIVATE_KEY_PATH as string
export const CERT_PUBLIC_KEY_PATH = process.env.CERT_PUBLIC_KEY_PATH as string
