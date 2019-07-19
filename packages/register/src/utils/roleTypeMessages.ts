import { defineMessages } from 'react-intl'

export const roleMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  FIELD_AGENT: {
    id: 'constants.fieldAgent',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'constants.registrationClerk',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'constants.localRegistrar',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'constants.districtRegistrar',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'constants.stateRegistrar',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'constants.nationalRegistrar',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  LOCAL_SYSTEM_ADMIN: {
    id: 'register.home.header.localSystemAdmin',
    defaultMessage: 'Sysadmin',
    description: 'The description for Sysadmin role'
  },
  NATIONAL_SYSTEM_ADMIN: {
    id: 'constants.nationalSystemAdmin',
    defaultMessage: 'System admin (national)',
    description: 'The description for System admin (national)'
  },
  PERFORMANCE_OVERSIGHT: {
    id: 'constants.performanceOversight',
    defaultMessage: 'Performance Oversight',
    description: 'The description for Performance Oversight role'
  },
  PERFORMANCE_MANAGEMENT: {
    id: 'constants.performanceManagement',
    defaultMessage: 'Performance Management',
    description: 'The description for Performance Management role'
  }
})

export const typeMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  HOSPITAL: {
    id: 'userSetup.type.hospital',
    defaultMessage: 'Hospital',
    description: 'The description for HOSPITAL type'
  },
  CHA: {
    id: 'constants.cha',
    defaultMessage: 'CHA',
    description: 'The description for CHA type'
  },
  ENTREPENEUR: {
    id: 'constants.entrepeneur',
    defaultMessage: 'Entrepeneur',
    description: 'The description for ENTREPENEUR type'
  },
  DATA_ENTRY_CLERK: {
    id: 'constants.dataEntryClerk',
    defaultMessage: 'Data entry clerk',
    description: 'The description for DATA_ENTRY_CLERK type'
  },
  SECRETARY: {
    id: 'constants.secretary',
    defaultMessage: 'Secretary',
    description: 'The description for SECRETARY type'
  },
  CHAIRMAN: {
    id: 'constants.chairman',
    defaultMessage: 'Chairman',
    description: 'The description for CHAIRMAN type'
  },
  MAYOR: {
    id: 'constants.mayor',
    defaultMessage: 'Mayor',
    description: 'The description for MAYOR type'
  },
  LOCAL_SYSTEM_ADMIN: {
    id: 'constants.localSystemAdmin',
    defaultMessage: 'System admin (local)',
    description: 'The description for LOCAL_SYSTEM_ADMIN type'
  },
  NATIONAL_SYSTEM_ADMIN: {
    id: 'constants.nationalSystemAdmin',
    defaultMessage: 'System admin (national)',
    description: 'The description for NATIONAL_SYSTEM_ADMIN type'
  },
  CABINET_DIVISION: {
    id: 'constants.cabinetDivision',
    defaultMessage: 'Cabinet Division',
    description: 'The description for CABINET_DIVISION type'
  },
  HEALTH_DIVISION: {
    id: 'constants.healthDivision',
    defaultMessage: 'Health Division',
    description: 'The description for HEALTH_DIVISION type'
  },
  ORG_DIVISION: {
    id: 'constants.orgDivision',
    defaultMessage: 'ORG Division',
    description: 'The description for ORG_DIVISION type'
  },
  BBS: {
    id: 'constants.bbs',
    defaultMessage: 'BBS',
    description: 'The description for BBS type'
  }
})
