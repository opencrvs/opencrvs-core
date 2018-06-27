export const HOST = process.env.AUTH_HOST || 'localhost'
export const PORT = process.env.AUTH_PORT || 2020

export const SMS_PROVIDER = process.env.SMS_PROVIDER || 'clickatell'

export const CLICKATELL_USER = process.env.CLICKATELL_USER
export const CLICKATELL_PASSWORD = process.env.CLICKATELL_PASSWORD
export const CLICKATELL_API_ID = process.env.CLICKATELL_API_ID

export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
