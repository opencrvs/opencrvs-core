import { countryLogo } from '@countryconfig/api/application/country-logo'
import { defineApplicationConfig } from '@opencrvs/toolkit/application-config'

export const applicationConfig = defineApplicationConfig({
  APPLICATION_NAME: 'Farajaland CRS',
  COUNTRY_LOGO: countryLogo,
  SYSTEM_IANA_TIMEZONE: 'Asia/Dhaka', // Default timezone for the country. Basis for date and time calculations during searches.
  CURRENCY: {
    languagesAndCountry: ['en-US'],
    isoCode: 'USD'
  },
  ADMIN_STRUCTURE: [
    {
      id: 'province',
      label: {
        id: 'field.address.province.label',
        defaultMessage: 'Province',
        description: 'Label for province in address'
      }
    },
    {
      id: 'district',
      label: {
        id: 'field.address.district.label',
        defaultMessage: 'District',
        description: 'Label for district in address'
      }
    },
    {
      id: 'village',
      label: {
        id: 'field.address.village.label',
        defaultMessage: 'Village',
        description: 'Label for village in address'
      }
    }
  ],
  PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',
  USER_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  SEARCH_DEFAULT_CRITERIA: 'TRACKING_ID'
  /*
   * SEARCH_DEFAULT_CRITERIA's value can be one of the following
   * | 'TRACKING_ID',
   * | 'REGISTRATION_NUMBER',
   * | 'NATIONAL_ID',
   * | 'NAME',
   * | 'PHONE_NUMBER',
   * | 'EMAIL'
   */
})
