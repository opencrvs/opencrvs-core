export const config = {
  API_GATEWAY_URL:
    process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:7070/',
  LANGUAGE: process.env.REACT_APP_LANGUAGE || 'en',
  COUNTRY: process.env.REACT_APP_COUNTRY || 'bgd',
  LOGIN_URL: process.env.REACT_APP_LOGIN_URL || 'http://localhost:3020',
  RESOURCES_URL:
    process.env.REACT_APP_RESOURCES_URL || 'http://localhost:3040/',
  PERFORMANCE_URL:
    process.env.REACT_APP_PERFORMANCE_APP_URL || 'http://localhost:3001',
  BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel'
}
