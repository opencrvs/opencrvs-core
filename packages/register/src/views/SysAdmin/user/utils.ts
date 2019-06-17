import { defineMessages } from 'react-intl'

export enum UserRole {
  FIELD_AGENT = 'Field Agent',
  REGISTRATION_CLERK = 'Registrar',
  LOCAL_REGISTRAR = 'Local Registrar',
  DISTRICT_REGISTRAR = 'District Registrar',
  STATE_REGISTRAR = 'State Registrar',
  NATIONAL_REGISTRAR = 'National Registrar'
}

export enum UserStatus {
  ACTIVE,
  PENDING
}

export const messages = defineMessages({
  queryError: {
    id: 'system.user.queryError',
    defaultMessage: 'An error occured while loading system users',
    description: 'The text when error ocurred loading system users'
  }
})
