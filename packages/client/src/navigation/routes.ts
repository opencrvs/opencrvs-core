/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { Event } from '@client/forms'

export const HOME = '/'
export const SELECT_VITAL_EVENT = '/events'

export const EVENT_INFO = '/events/:eventType/info'
export const SELECT_BIRTH_INFORMANT = `/drafts/:declarationId/events/${Event.BIRTH}/registration/informant`
export const SELECT_BIRTH_MAIN_CONTACT_POINT = `/drafts/:declarationId/events/${Event.BIRTH}/registration/contact`

export const DRAFT_BIRTH_PARENT_FORM = `/drafts/:declarationId/events/${Event.BIRTH}`
export const DRAFT_BIRTH_PARENT_FORM_PAGE = `/drafts/:declarationId/events/${Event.BIRTH}/:pageId`
export const DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP = `/drafts/:declarationId/events/${Event.BIRTH}/:pageId/group/:groupId`
export const DRAFT_BIRTH_APPLICANT_FORM = `/events/${Event.BIRTH}/contact`
export const DRAFT_BIRTH_PARENT_FORM_TAB = `/drafts/:declarationId/events/${Event.BIRTH}/parent/:tabId`

export const SELECT_DEATH_INFORMANT = `/drafts/:declarationId/events/${Event.DEATH}/registration/informant`
export const SELECT_DEATH_MAIN_CONTACT_POINT = `/drafts/:declarationId/events/${Event.DEATH}/registration/contact`
export const DRAFT_DEATH_FORM = `/drafts/:declarationId/events/${Event.DEATH}`
export const DRAFT_DEATH_FORM_PAGE = `/drafts/:declarationId/events/${Event.DEATH}/:pageId`
export const DRAFT_DEATH_FORM_PAGE_GROUP = `/drafts/:declarationId/events/${Event.DEATH}/:pageId/group/:groupId`

export const REVIEW_EVENT_PARENT_FORM_PAGE =
  '/reviews/:declarationId/events/:event/parent/:pageId'
export const REVIEW_EVENT_PARENT_FORM_PAGE_GROUP =
  '/reviews/:declarationId/events/:event/parent/:pageId/group/:groupId'

export const CERTIFICATE_CORRECTION = '/correction/:declarationId/:pageId'

export const CERTIFICATE_CORRECTION_REVIEW =
  '/correction/:declarationId/:pageId/:groupId'

export const VERIFY_CORRECTOR = '/correction/:declarationId/verify/:corrector'

export const SAVED_REGISTRATION = '/saved'
export const REJECTED_REGISTRATION = '/rejected'
export const SEARCH = '/search'
export const SEARCH_RESULT = '/search-result/:searchType/:searchText'
export const MY_RECORDS = '/my-records'
export const MY_DRAFTS = '/my-drafts'
export const REVIEW_DUPLICATES = '/duplicates/:declarationId'
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
export const CHANGE_PHONE = '/settings/phone'
export const CONFIG = '/config'

export const DECLARATION_DETAIL = '/details/:declarationId'
export const DECLARATION_RECORD_AUDIT = '/record-audit/:tab/:declarationId'

export const SYS_ADMIN_HOME = '/sys-admin-home'
export const SYS_ADMIN_HOME_TAB = '/sys-admin-home/:tabId'

export const PERFORMANCE_HOME = '/performance'
export const PERFORMANCE_REPORT_LIST = '/performance/reports'
export const PERFORMANCE_REPORT = '/performance/report'
export const OPERATIONAL_REPORT = '/performance/operations'
export const EVENT_REGISTRATION_RATES =
  '/performance/operations/regestrationRates/:eventType'
export const WORKFLOW_STATUS = '/performance/operations/workflowStatus'
export const PERFORMANCE_FIELD_AGENT_LIST = '/performance/field-agents'

export const TEAM_SEARCH = '/team/search'
export const TEAM_USER_LIST = '/team/users'

export const CREATE_USER = '/createUser'
export const CREATE_USER_ON_LOCATION = '/createUserInLocation/:locationId'
export const CREATE_USER_SECTION = '/createUser/:sectionId/:groupId'
export const REVIEW_USER_FORM = '/user/:userId/:sectionId/:groupId'
export const REVIEW_USER_DETAILS = '/user/:userId/:sectionId/'

export const USER_PROFILE = '/userProfile/:userId'
