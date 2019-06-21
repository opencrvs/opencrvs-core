import { defineMessages } from 'react-intl'

export const roleMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  LOCAL_SYSTEM_ADMIN: {
    id: 'register.home.header.LOCAL_SYSTEM_ADMIN',
    defaultMessage: 'Sysadmin',
    description: 'The description for Sysadmin role'
  }
})

export const typeMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  HOSPITAL: {
    id: 'userSetup.type.HOSPITAL',
    defaultMessage: 'Hospital',
    description: 'The description for HOSPITAL type'
  },
  CHA: {
    id: 'userSetup.type.CHA',
    defaultMessage: 'CHA',
    description: 'The description for CHA type'
  },
  ENTREPENEUR: {
    id: 'userSetup.type.ENTREPENEUR',
    defaultMessage: 'Entrepeneur',
    description: 'The description for ENTREPENEUR type'
  },
  DATA_ENTRY_CLERK: {
    id: 'userSetup.type.DATA_ENTRY_CLERK',
    defaultMessage: 'Data entry clerk',
    description: 'The description for DATA_ENTRY_CLERK type'
  },
  SECRETARY: {
    id: 'userSetup.type.SECRETARY',
    defaultMessage: 'Secretary',
    description: 'The description for SECRETARY type'
  },
  CHAIRMAN: {
    id: 'userSetup.type.CHAIRMAN',
    defaultMessage: 'Chairman',
    description: 'The description for CHAIRMAN type'
  },
  MAYOR: {
    id: 'userSetup.type.MAYOR',
    defaultMessage: 'Mayor',
    description: 'The description for MAYOR type'
  },
  LOCAL_SYSTEM_ADMIN: {
    id: 'userSetup.type.LOCAL_SYSTEM_ADMIN',
    defaultMessage: 'System admin (local)',
    description: 'The description for LOCAL_SYSTEM_ADMIN type'
  },
  NATIONAL_SYSTEM_ADMIN: {
    id: 'userSetup.type.NATIONAL_SYSTEM_ADMIN',
    defaultMessage: 'System admin (national)',
    description: 'The description for NATIONAL_SYSTEM_ADMIN type'
  }
})
