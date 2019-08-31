import { defineMessages, MessageDescriptor } from 'react-intl'

export enum QUESTION_KEYS {
  BIRTH_TOWN,
  HIGH_SCHOOL,
  MOTHER_NAME,
  FAVORITE_TEACHER,
  FAVORITE_MOVIE,
  FAVORITE_SONG,
  FAVORITE_FOOD,
  FIRST_CHILD_NAME
}
interface IUserMessages {
  accountTitle: MessageDescriptor
  BBS: MessageDescriptor
  BIRTH_TOWN: MessageDescriptor
  CABINET_DIVISION: MessageDescriptor
  CHA: MessageDescriptor
  CHAIRMAN: MessageDescriptor
  changeLanguageMessege: MessageDescriptor
  changeLanguageSuccessMessage: MessageDescriptor
  changeLanguageTitle: MessageDescriptor
  DATA_ENTRY_CLERK: MessageDescriptor
  DISTRICT_REGISTRAR: MessageDescriptor
  ENTREPENEUR: MessageDescriptor
  FAVORITE_FOOD: MessageDescriptor
  FAVORITE_MOVIE: MessageDescriptor
  FAVORITE_SONG: MessageDescriptor
  FAVORITE_TEACHER: MessageDescriptor
  FIRST_CHILD_NAME: MessageDescriptor
  HEALTH_DIVISION: MessageDescriptor
  HIGH_SCHOOL: MessageDescriptor
  HOSPITAL: MessageDescriptor
  labelEnglishName: MessageDescriptor
  LOCAL_REGISTRAR: MessageDescriptor
  LOCAL_SYSTEM_ADMIN: MessageDescriptor
  MAYOR: MessageDescriptor
  MOTHER_NAME: MessageDescriptor
  NATIONAL_REGISTRAR: MessageDescriptor
  NATIONAL_SYSTEM_ADMIN: MessageDescriptor
  ORG_DIVISION: MessageDescriptor
  PERFORMANCE_MANAGEMENT: MessageDescriptor
  PERFORMANCE_OVERSIGHT: MessageDescriptor
  profileTitle: MessageDescriptor
  REGISTRATION_AGENT: MessageDescriptor
  SECRETARY: MessageDescriptor
  securityTitle: MessageDescriptor
  settingsTitle: MessageDescriptor
  STATE_REGISTRAR: MessageDescriptor
  systemTitle: MessageDescriptor
  FIELD_AGENT: MessageDescriptor
}

interface IDynamicUserMessages {
  [key: string]: MessageDescriptor
}

const messagesToDefine: IUserMessages = {
  accountTitle: {
    defaultMessage: 'Account',
    description: 'Account header',
    id: 'settings.account.tile'
  },
  BBS: {
    defaultMessage: 'BBS',
    description: 'The description for BBS type',
    id: 'constants.bbs'
  },
  BIRTH_TOWN: {
    defaultMessage: 'What city were you born in?',
    description: 'The description for BIRTH_TOWN key',
    id: 'userSetup.securityQuestions.birthTown'
  },
  CABINET_DIVISION: {
    defaultMessage: 'Cabinet Division',
    description: 'The description for CABINET_DIVISION type',
    id: 'constants.cabinetDivision'
  },
  CHA: {
    defaultMessage: 'CHA',
    description: 'The description for CHA type',
    id: 'constants.cha'
  },
  CHAIRMAN: {
    defaultMessage: 'Chairman',
    description: 'The description for CHAIRMAN type',
    id: 'constants.chairman'
  },
  changeLanguageMessege: {
    defaultMessage: 'Your prefered language that you want to use on OpenCRVS',
    description: 'Change language message',
    id: 'settings.message.changeLanguage'
  },
  changeLanguageSuccessMessage: {
    defaultMessage: 'Language updated to {language}',
    description: 'Change language success',
    id: 'settings.changeLanguage.success'
  },
  changeLanguageTitle: {
    defaultMessage: 'Change language',
    description: 'Change language title',
    id: 'settings.changeLanguage'
  },
  DATA_ENTRY_CLERK: {
    defaultMessage: 'Data entry clerk',
    description: 'The description for DATA_ENTRY_CLERK type',
    id: 'constants.dataEntryClerk'
  },
  DISTRICT_REGISTRAR: {
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role',
    id: 'constants.districtRegistrar'
  },
  ENTREPENEUR: {
    defaultMessage: 'Entrepeneur',
    description: 'The description for ENTREPENEUR type',
    id: 'constants.entrepeneur'
  },
  FAVORITE_FOOD: {
    defaultMessage: 'What is your favorite food?',
    description: 'The description for FAVORITE_FOOD key',
    id: 'userSetup.securityQuestions.favoriteFood'
  },
  FAVORITE_MOVIE: {
    defaultMessage: 'What is your favorite movie?',
    description: 'The description for FAVORITE_MOVIE key',
    id: 'userSetup.securityQuestions.favoriteMovie'
  },
  FAVORITE_SONG: {
    defaultMessage: 'What is your favorite song?',
    description: 'The description for FAVORITE_SONG key',
    id: 'userSetup.securityQuestions.favoriteSong'
  },
  FAVORITE_TEACHER: {
    defaultMessage: 'What is the name of your favorite school teacher?',
    description: 'The description for FAVORITE_TEACHER key',
    id: 'userSetup.securityQuestions.favoriteTeacher'
  },
  FIELD_AGENT: {
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role',
    id: 'constants.fieldAgent'
  },
  FIRST_CHILD_NAME: {
    defaultMessage: "What is your first child's name?",
    description: 'The description for FIRST_CHILD_NAME key',
    id: 'userSetup.securityQuestions.firstChildName'
  },
  HEALTH_DIVISION: {
    defaultMessage: 'Health Division',
    description: 'The description for HEALTH_DIVISION type',
    id: 'constants.healthDivision'
  },
  HIGH_SCHOOL: {
    defaultMessage: 'What is the name of your high school?',
    description: 'The description for HIGH_SCHOOL key',
    id: 'userSetup.securityQuestions.hightSchool'
  },
  HOSPITAL: {
    defaultMessage: 'Hospital',
    description: 'The description for HOSPITAL type',
    id: 'userSetup.type.hospital'
  },
  labelEnglishName: {
    defaultMessage: 'English name',
    description: 'English name label',
    id: 'settings.user.label.nameEN'
  },
  LOCAL_REGISTRAR: {
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role',
    id: 'constants.localRegistrar'
  },
  LOCAL_SYSTEM_ADMIN: {
    defaultMessage: 'Sysadmin',
    description: 'The description for Sysadmin role',
    id: 'home.header.localSystemAdmin'
  },
  MAYOR: {
    defaultMessage: 'Mayor',
    description: 'The description for MAYOR type',
    id: 'constants.mayor'
  },
  MOTHER_NAME: {
    defaultMessage: "What is your mother's name?",
    description: 'The description for MOTHER_NAME key',
    id: 'userSetup.securityQuestions.motherName'
  },
  NATIONAL_REGISTRAR: {
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role',
    id: 'constants.nationalRegistrar'
  },
  NATIONAL_SYSTEM_ADMIN: {
    defaultMessage: 'System admin (national)',
    description: 'The description for System admin (national)',
    id: 'constants.nationalSystemAdmin'
  },
  ORG_DIVISION: {
    defaultMessage: 'ORG Division',
    description: 'The description for ORG_DIVISION type',
    id: 'constants.orgDivision'
  },
  PERFORMANCE_MANAGEMENT: {
    defaultMessage: 'Performance Management',
    description: 'The description for Performance Management role',
    id: 'constants.performanceManagement'
  },
  PERFORMANCE_OVERSIGHT: {
    defaultMessage: 'Performance Oversight',
    description: 'The description for Performance Oversight role',
    id: 'constants.performanceOversight'
  },
  profileTitle: {
    defaultMessage: 'Profile',
    description: 'Profile header',
    id: 'settings.profile.tile'
  },
  REGISTRATION_AGENT: {
    defaultMessage: 'Registration Agent',
    description: 'The description for REGISTRATION_AGENT role',
    id: 'constants.registrationAgent'
  },
  SECRETARY: {
    defaultMessage: 'Secretary',
    description: 'The description for SECRETARY type',
    id: 'constants.secretary'
  },
  securityTitle: {
    defaultMessage: 'Security',
    description: 'Security header',
    id: 'settings.security.tile'
  },
  settingsTitle: {
    defaultMessage: 'Settings',
    description: 'Title of the settings page',
    id: 'settings.title'
  },
  STATE_REGISTRAR: {
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role',
    id: 'constants.stateRegistrar'
  },
  systemTitle: {
    defaultMessage: 'System',
    description: 'System header',
    id: 'settings.system.tile'
  }
}

export const userMessages: IUserMessages &
  IDynamicUserMessages = defineMessages(messagesToDefine)
