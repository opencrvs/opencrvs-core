export const config = {
  API_GATEWAY_URL:
    process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:7070/',
  LANGUAGE: process.env.REACT_APP_LANGUAGE || 'en',
  LOCALE: process.env.REACT_APP_LOCALE || 'gbr',
  COUNTRY: process.env.REACT_APP_LOCALE || 'BD',
  LOGIN_URL: process.env.REACT_APP_LOGIN_URL || 'http://localhost:3020'
}
