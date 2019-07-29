import { defineMessages } from 'react-intl'

interface IUserMessages {
  FIELD_AGENT: ReactIntl.FormattedMessage.MessageDescriptor
  REGISTRATION_AGENT: ReactIntl.FormattedMessage.MessageDescriptor
  LOCAL_REGISTRAR: ReactIntl.FormattedMessage.MessageDescriptor
  DISTRICT_REGISTRAR: ReactIntl.FormattedMessage.MessageDescriptor
  STATE_REGISTRAR: ReactIntl.FormattedMessage.MessageDescriptor
  NATIONAL_REGISTRAR: ReactIntl.FormattedMessage.MessageDescriptor
  LOCAL_SYSTEM_ADMIN: ReactIntl.FormattedMessage.MessageDescriptor
  NATIONAL_SYSTEM_ADMIN: ReactIntl.FormattedMessage.MessageDescriptor
  PERFORMANCE_OVERSIGHT: ReactIntl.FormattedMessage.MessageDescriptor
  PERFORMANCE_MANAGEMENT: ReactIntl.FormattedMessage.MessageDescriptor
  HOSPITAL: ReactIntl.FormattedMessage.MessageDescriptor
  CHA: ReactIntl.FormattedMessage.MessageDescriptor
  ENTREPENEUR: ReactIntl.FormattedMessage.MessageDescriptor
  DATA_ENTRY_CLERK: ReactIntl.FormattedMessage.MessageDescriptor
  SECRETARY: ReactIntl.FormattedMessage.MessageDescriptor
  CHAIRMAN: ReactIntl.FormattedMessage.MessageDescriptor
  MAYOR: ReactIntl.FormattedMessage.MessageDescriptor
  CABINET_DIVISION: ReactIntl.FormattedMessage.MessageDescriptor
  HEALTH_DIVISION: ReactIntl.FormattedMessage.MessageDescriptor
  ORG_DIVISION: ReactIntl.FormattedMessage.MessageDescriptor
  BBS: ReactIntl.FormattedMessage.MessageDescriptor
  BIRTH_TOWN: ReactIntl.FormattedMessage.MessageDescriptor
  HIGH_SCHOOL: ReactIntl.FormattedMessage.MessageDescriptor
  MOTHER_NAME: ReactIntl.FormattedMessage.MessageDescriptor
  FAVORITE_TEACHER: ReactIntl.FormattedMessage.MessageDescriptor
  FAVORITE_MOVIE: ReactIntl.FormattedMessage.MessageDescriptor
  FAVORITE_SONG: ReactIntl.FormattedMessage.MessageDescriptor
  FAVORITE_FOOD: ReactIntl.FormattedMessage.MessageDescriptor
  FIRST_CHILD_NAME: ReactIntl.FormattedMessage.MessageDescriptor
  settingsTitle: ReactIntl.FormattedMessage.MessageDescriptor
  profileTitle: ReactIntl.FormattedMessage.MessageDescriptor
  securityTitle: ReactIntl.FormattedMessage.MessageDescriptor
  accountTitle: ReactIntl.FormattedMessage.MessageDescriptor
  systemTitle: ReactIntl.FormattedMessage.MessageDescriptor
  labelEnglishName: ReactIntl.FormattedMessage.MessageDescriptor
  changeLanguageTitle: ReactIntl.FormattedMessage.MessageDescriptor
  changeLanguageMessege: ReactIntl.FormattedMessage.MessageDescriptor
  changeLanguageSuccessMessage: ReactIntl.FormattedMessage.MessageDescriptor
}

interface IDynamicUserMessages {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IUserMessages = {
  settingsTitle: {
    id: 'settings.title',
    defaultMessage: 'Settings',
    description: 'Title of the settings page'
  },
  profileTitle: {
    id: 'settings.profile.tile',
    defaultMessage: 'Profile',
    description: 'Profile header'
  },
  securityTitle: {
    id: 'settings.security.tile',
    defaultMessage: 'Security',
    description: 'Security header'
  },
  accountTitle: {
    id: 'settings.account.tile',
    defaultMessage: 'Account',
    description: 'Account header'
  },
  systemTitle: {
    id: 'settings.system.tile',
    defaultMessage: 'System',
    description: 'System header'
  },
  labelEnglishName: {
    id: 'settings.user.label.nameEN',
    defaultMessage: 'English name',
    description: 'English name label'
  },
  changeLanguageTitle: {
    id: 'settings.changeLanguage',
    defaultMessage: 'Change language',
    description: 'Change language title'
  },
  changeLanguageMessege: {
    id: 'settings.message.changeLanguage',
    defaultMessage: 'Your prefered language that you want to use on OpenCRVS',
    description: 'Change language message'
  },
  changeLanguageSuccessMessage: {
    id: 'settings.changeLanguage.success',
    defaultMessage: 'Language updted to English',
    description: 'Change language success'
  },
  BIRTH_TOWN: {
    id: 'userSetup.securityQuestions.birthTown',
    defaultMessage: 'What city were you born in?',
    description: 'The description for BIRTH_TOWN key'
  },
  HIGH_SCHOOL: {
    id: 'userSetup.securityQuestions.hightSchool',
    defaultMessage: 'What is the name of your high school?',
    description: 'The description for HIGH_SCHOOL key'
  },
  MOTHER_NAME: {
    id: 'userSetup.securityQuestions.motherName',
    defaultMessage: "What is your mother's name?",
    description: 'The description for MOTHER_NAME key'
  },
  FAVORITE_TEACHER: {
    id: 'userSetup.securityQuestions.favoriteTeacher',
    defaultMessage: 'What is the name of your favorite school teacher?',
    description: 'The description for FAVORITE_TEACHER key'
  },
  FAVORITE_MOVIE: {
    id: 'userSetup.securityQuestions.favoriteMovie',
    defaultMessage: 'What is your favorite movie?',
    description: 'The description for FAVORITE_MOVIE key'
  },
  FAVORITE_SONG: {
    id: 'userSetup.securityQuestions.favoriteSong',
    defaultMessage: 'What is your favorite song?',
    description: 'The description for FAVORITE_SONG key'
  },
  FAVORITE_FOOD: {
    id: 'userSetup.securityQuestions.favoriteFood',
    defaultMessage: 'What is your favorite food?',
    description: 'The description for FAVORITE_FOOD key'
  },
  FIRST_CHILD_NAME: {
    id: 'userSetup.securityQuestions.firstChildName',
    defaultMessage: "What is your first child's name?",
    description: 'The description for FIRST_CHILD_NAME key'
  },
  FIELD_AGENT: {
    id: 'constants.fieldAgent',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_AGENT: {
    id: 'constants.registrationAgent',
    defaultMessage: 'Registration Agent',
    description: 'The description for REGISTRATION_AGENT role'
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
    id: 'home.header.localSystemAdmin',
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
  },
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
}

export const userMessages: IUserMessages &
  IDynamicUserMessages = defineMessages(messagesToDefine)
