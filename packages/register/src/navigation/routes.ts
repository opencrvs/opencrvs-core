import { Event } from '@register/forms'

export const HOME = '/'
export const SELECT_VITAL_EVENT = '/events'

export const SELECT_BIRTH_INFORMANT = `/drafts/:applicationId/events/${Event.BIRTH}/registration/informant`
export const SELECT_BIRTH_PRIMARY_APPLICANT = `/drafts/:applicationId/events/${Event.BIRTH}/registration/applicant`
export const SELECT_BIRTH_MAIN_CONTACT_POINT = `/drafts/:applicationId/events/${Event.BIRTH}/registration/contact`

export const DRAFT_BIRTH_PARENT_FORM = `/drafts/:applicationId/events/${Event.BIRTH}`
export const DRAFT_BIRTH_PARENT_FORM_PAGE = `/drafts/:applicationId/events/${Event.BIRTH}/:pageId`
export const DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP = `/drafts/:applicationId/events/${Event.BIRTH}/:pageId/group/:groupId`
export const DRAFT_BIRTH_APPLICANT_FORM = `/events/${Event.BIRTH}/contact`
export const DRAFT_BIRTH_PARENT_FORM_TAB = `/drafts/:applicationId/events/${Event.BIRTH}/parent/:tabId`

export const SELECT_DEATH_INFORMANT = `/drafts/:applicationId/events/${Event.DEATH}/registration/informant`
export const SELECT_DEATH_MAIN_CONTACT_POINT = `/drafts/:applicationId/events/${Event.DEATH}/registration/contact`
export const DRAFT_DEATH_FORM = `/drafts/:applicationId/events/${Event.DEATH}`
export const DRAFT_DEATH_FORM_PAGE = `/drafts/:applicationId/events/${Event.DEATH}/:pageId`
export const DRAFT_DEATH_FORM_PAGE_GROUP = `/drafts/:applicationId/events/${Event.DEATH}/:pageId/group/:groupId`

export const REVIEW_EVENT_PARENT_FORM_PAGE =
  '/reviews/:applicationId/events/:event/parent/:pageId'
export const REVIEW_EVENT_PARENT_FORM_PAGE_GROUP =
  '/reviews/:applicationId/events/:event/parent/:pageId/group/:groupId'

export const SAVED_REGISTRATION = '/saved'
export const REJECTED_REGISTRATION = '/rejected'
export const SEARCH = '/search'
export const SEARCH_RESULT = '/search-result/:searchType/:searchText'
export const MY_RECORDS = '/my-records'
export const MY_DRAFTS = '/my-drafts'
export const REVIEW_DUPLICATES = '/duplicates/:applicationId'
export const CONFIRMATION_SCREEN = '/confirm'
export const CERTIFICATE_COLLECTOR =
  '/cert/collector/:registrationId/:eventType/:groupId'
export const VERIFY_COLLECTOR =
  '/print/check/:registrationId/:eventType/:collector'
export const REVIEW_CERTIFICATE = '/review/:registrationId/:eventType'

export const PRINT_CERTIFICATE_PAYMENT = '/payment/:registrationId/:eventType'

export const REGISTRAR_HOME = '/registration-home'
export const REGISTRAR_HOME_TAB = '/registration-home/:tabId/:selectorId?'
export const FIELD_AGENT_HOME_TAB = '/field-agent-home/:tabId'
export const SETTINGS = '/settings'

export const APPLICATION_DETAIL = '/details/:applicationId'

export const SYS_ADMIN_HOME = '/sys-admin-home'
export const SYS_ADMIN_HOME_TAB = '/sys-admin-home/:tabId'

export const CREATE_USER = '/createUser'
export const CREATE_USER_SECTION = '/createUser/:sectionId/:groupId'
