import { COUNTRY_CONFIG_URL } from '@countryconfig/constants'

export const NOTIFICATION_TRANSPORT =
  process.env.NOTIFICATION_TRANSPORT || 'email'

/* Email address where infrastructure alert should be forwarded to */
export const ALERT_EMAIL = process.env.ALERT_EMAIL || 'alerts@example.com'

/* SMTP (Email) */
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : 587
export const SMTP_USERNAME = process.env.SMTP_USERNAME
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD
export const SMTP_SECURE = process.env.SMTP_SECURE === 'true'

/* Infobip */
export const INFOBIP_GATEWAY_ENDPOINT = process.env.INFOBIP_GATEWAY_ENDPOINT
  ? process.env.INFOBIP_GATEWAY_ENDPOINT
  : ''

export const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY
  ? process.env.INFOBIP_API_KEY
  : ''

export const INFOBIP_SENDER_ID = process.env.INFOBIP_SENDER_ID
  ? process.env.INFOBIP_SENDER_ID
  : ''

export const COUNTRY_LOGO_URL = `${COUNTRY_CONFIG_URL}/content/country-logo`

export const LOGIN_URL = process.env.LOGIN_URL as string

export const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL_ADDRESS
  ? process.env.SENDER_EMAIL_ADDRESS
  : ''
