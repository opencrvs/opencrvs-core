export const HOME = '/'
export const SELECT_VITAL_EVENT = '/events'
export const SELECT_INFORMANT =
  '/drafts/:applicationId/events/birth/registration/informant'
export const SELECT_PRIMARY_APPLICANT =
  '/drafts/:applicationId/events/birth/registration/applicant'
export const SELECT_MAIN_CONTACT_POINT =
  '/drafts/:applicationId/events/birth/registration/contact'

export const DRAFT_BIRTH_PARENT_FORM = '/drafts/:applicationId/events/birth'
export const DRAFT_BIRTH_PARENT_FORM_PAGE =
  '/drafts/:applicationId/events/birth/:pageId'
export const DRAFT_BIRTH_APPLICANT_FORM = '/events/birth/contact'
export const DRAFT_BIRTH_PARENT_FORM_TAB =
  '/drafts/:applicationId/events/birth/parent/:tabId'

export const DRAFT_DEATH_FORM = '/drafts/:applicationId/events/death'
export const DRAFT_DEATH_FORM_PAGE =
  '/drafts/:applicationId/events/death/:pageId'

export const REVIEW_EVENT_PARENT_FORM_PAGE =
  '/reviews/:applicationId/events/:event/parent/:pageId'

export const SAVED_REGISTRATION = '/saved'
export const REJECTED_REGISTRATION = '/rejected'
export const SEARCH = '/search'
export const SEARCH_RESULT = '/search-result/:searchType/:searchText'
export const MY_RECORDS = '/my-records'
export const MY_DRAFTS = '/my-drafts'
export const REVIEW_DUPLICATES = '/duplicates/:applicationId'
export const CONFIRMATION_SCREEN = '/confirm'
export const PRINT_CERTIFICATE = '/print/:registrationId/:eventType'

export const REGISTRAR_HOME = '/registrar-home'
export const REGISTRAR_HOME_TAB = '/registrar-home/:tabId'
export const FIELD_AGENT_HOME_TAB = '/field-agent-home/:tabId'
export const SETTINGS = '/settings'

export const APPLICATION_DETAIL = '/details/:applicationId'

export const SYS_ADMIN_HOME = '/sys-admin-home'
export const SYS_ADMIN_HOME_TAB = '/sys-admin-home/:tabId'

export const CREATE_USER = '/createUser'
export const CREATE_USER_SECTION = '/createUser/:sectionId'
