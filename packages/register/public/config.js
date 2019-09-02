// this file provides the dev defaults to the OpenCRVS app, don't commit country specific changes here.
window.config = {
  API_GATEWAY_URL: 'http://localhost:7070/',
  BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel',
  COUNTRY: 'bgd',
  DESKTOP_TIME_OUT_MILLISECONDS: 900000, // 15 mins
  HEALTH_FACILITY_FILTER: 'UPAZILA',
  LANGUAGES: 'en,bn',
  LOGIN_URL: 'http://localhost:3020',
  PERFORMANCE_URL: 'http://localhost:3001',
  RESOURCES_URL: 'http://localhost:3040/bgd',
  CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 45, // days
  CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 1825, // 5 years =  (5 * 365) days
  CERTIFICATE_PRINT_LOWEST_CHARGE: 25, // taka
  CERTIFICATE_PRINT_HIGHEST_CHARGE: 50 // taka
}
