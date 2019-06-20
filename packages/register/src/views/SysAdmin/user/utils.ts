import { defineMessages } from 'react-intl'

export enum UserRole {
  FIELD_AGENT = 'Field Agent',
  REGISTRATION_CLERK = 'Registration Agent',
  LOCAL_REGISTRAR = 'Registrar',
  DISTRICT_REGISTRAR = 'District Registrar',
  STATE_REGISTRAR = 'State Registrar',
  NATIONAL_REGISTRAR = 'National Registrar',
  LOCAL_SYSTEM_ADMIN = 'System Admin (Local)'
}

export enum UserStatus {
  ACTIVE,
  PENDING,
  DISABLED
}

export const messages = defineMessages({
  queryError: {
    id: 'system.user.queryError',
    defaultMessage: 'An error occured while loading system users',
    description: 'The text when error ocurred loading system users'
  }
})
