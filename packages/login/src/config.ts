export const config = {
  COUNTRY: process.env.REACT_APP_COUNTRY || 'bgd',
  LANGUAGE: process.env.REACT_APP_LANGUAGE || 'bn',
  AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:4040/',
  REGISTER_APP_URL:
    process.env.REACT_APP_REGISTER_APP_URL || 'http://localhost:3000/'
}
