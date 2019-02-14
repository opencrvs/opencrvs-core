import { readFileSync } from 'fs'

export const HOST = process.env.AUTH_HOST || 'localhost'
export const PORT = process.env.AUTH_PORT || 2020

export const LANGUAGE = process.env.LANGUAGE || 'bn'
export const COUNTRY_ALPHA3 = process.env.COUNTRY_ALPHA3 || 'BGD'
/* 
  For these locales sms content will not be sent as unicoded payload 
  In future based on our experience on different countries we can add more locals here
*/
export const NON_UNICODED_LANGUAGES = ['en']

export const SMS_PROVIDER = process.env.SMS_PROVIDER || 'infobip'

export const CLICKATELL_USER = process.env.CLICKATELL_USER_PATH
  ? readFileSync(process.env.CLICKATELL_USER_PATH).toString()
  : ''
export const CLICKATELL_PASSWORD = process.env.CLICKATELL_PASSWORD_PATH
  ? readFileSync(process.env.CLICKATELL_PASSWORD_PATH).toString()
  : ''
export const CLICKATELL_API_ID = process.env.CLICKATELL_API_ID_PATH
  ? readFileSync(process.env.CLICKATELL_API_ID_PATH).toString()
  : ''

export const INFOBIP_GATEWAY_ENDPOINT = process.env
  .INFOBIP_GATEWAY_ENDPOINT_PATH
  ? readFileSync(process.env.INFOBIP_GATEWAY_ENDPOINT_PATH).toString()
  : 'https://j45mv.api.infobip.com/sms/1/text/single'

export const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY_PATH
  ? readFileSync(process.env.INFOBIP_API_KEY_PATH).toString()
  : 'b2NydnNfcGxhbjpPY3J2czEyMw=='

export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
