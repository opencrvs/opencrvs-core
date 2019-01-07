export const config = {
  API_GATEWAY_URL:
    process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:7070/',
  LANGUAGE: process.env.REACT_APP_LANGUAGE || 'en',
  COUNTRY: process.env.REACT_APP_COUNTRY || 'bgd',
  LOGIN_URL:
    process.env.REACT_APP_LOGIN_URL ||
    'https://login.opencrvs-staging.jembi.org',
  BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel'
}
