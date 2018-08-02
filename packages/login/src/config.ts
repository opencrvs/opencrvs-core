export const config = {
  LOCALE: process.env.REACT_APP_LOCALE || 'gb',
  AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:4040/',
  REGISTER_APP_URL:
    process.env.REACT_APP_REGISTER_APP_URL || 'http://localhost:3000/'
}
