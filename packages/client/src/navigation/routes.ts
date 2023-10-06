/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { Event } from '@client/utils/gateway'

export const HOME = '/'
export const SELECT_VITAL_EVENT = '/events'

export const DRAFT_BIRTH_PARENT_FORM = `/drafts/:declarationId/events/${Event.Birth}`
export const DRAFT_BIRTH_PARENT_FORM_PAGE = `/drafts/:declarationId/events/${Event.Birth}/:pageId`
export const DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP = `/drafts/:declarationId/events/${Event.Birth}/:pageId/group/:groupId`
export const SELECT_DEATH_INFORMANT = `/drafts/:declarationId/events/${Event.Death}/registration/informantType`
export const DRAFT_DEATH_FORM = `/drafts/:declarationId/events/${Event.Death}`
export const DRAFT_DEATH_FORM_PAGE = `/drafts/:declarationId/events/${Event.Death}/:pageId`
export const DRAFT_DEATH_FORM_PAGE_GROUP = `/drafts/:declarationId/events/${Event.Death}/:pageId/group/:groupId`
export const SELECT_MARRIAGE_INFORMANT = `/drafts/:declarationId/events/${Event.Marriage}/registration/informantType`
export const DRAFT_MARRIAGE_FORM = `/drafts/:declarationId/events/${Event.Marriage}`
export const DRAFT_MARRIAGE_FORM_PAGE = `/drafts/:declarationId/events/${Event.Marriage}/:pageId`
export const DRAFT_MARRIAGE_FORM_PAGE_GROUP = `/drafts/:declarationId/events/${Event.Marriage}/:pageId/group/:groupId`

export const REVIEW_EVENT_PARENT_FORM_PAGE =
  '/reviews/:declarationId/events/:event/parent/:pageId'

export const REVIEW_EVENT_PARENT_FORM_PAGE_GROUP =
  '/reviews/:declarationId/events/:event/parent/:pageId/group/:groupId'

export const REVIEW_CORRECTION = '/review-correction/:declarationId'

export const CERTIFICATE_CORRECTION = '/correction/:declarationId/:pageId'

export const CERTIFICATE_CORRECTION_REVIEW =
  '/correction/:declarationId/:pageId/:groupId'

export const VERIFY_CORRECTOR = '/correction/:declarationId/verify/:corrector'

export const SEARCH = '/search'
export const SEARCH_RESULT = '/search-result/:searchType/:searchText'
export const CERTIFICATE_COLLECTOR =
  '/cert/collector/:registrationId/:eventType/:groupId'
export const ISSUE_COLLECTOR = '/issue/:registrationId/:pageId'
export const ISSUE_VERIFY_COLLECTOR =
  '/issue/check/:registrationId/:eventType/:collector'
export const VERIFY_COLLECTOR =
  '/print/check/:registrationId/:eventType/:collector'
export const REVIEW_CERTIFICATE = '/review/:registrationId/:eventType'

export const PRINT_CERTIFICATE_PAYMENT =
  '/print/payment/:registrationId/:eventType'
export const ISSUE_CERTIFICATE_PAYMENT =
  '/issue/payment/:registrationId/:eventType'

export const REGISTRAR_HOME = '/registration-home'
export const REGISTRAR_HOME_TAB = '/registration-home/:tabId/:selectorId?'
export const REGISTRAR_HOME_TAB_PAGE =
  '/registration-home/:tabId/:selectorId/:pageId'

export const SETTINGS = '/settings'
export const CERTIFICATE_CONFIG = '/config/certificate'
export const APPLICATION_CONFIG = '/config/application'
export const SYSTEM_LIST = '/config/integration'
export const USER_ROLES_CONFIG = '/config/userroles'

export const INFORMANT_NOTIFICATION = '/communications/informantnotification'

export const DECLARATION_RECORD_AUDIT = '/record-audit/:tab/:declarationId'

export const PERFORMANCE_HOME = '/performance'
export const ADVANCED_SEARCH = '/search-result/advanced-search'
export const ADVANCED_SEARCH_RESULT = '/advanced-search/result'

export const VS_EXPORTS = '/vsexports'

export const EVENT_COMPLETENESS_RATES =
  '/performance/operations/completenessRates/:eventType'
export const WORKFLOW_STATUS = '/performance/operations/workflowStatus'
export const PERFORMANCE_FIELD_AGENT_LIST = '/performance/field-agents'
export const PERFORMANCE_REGISTRATIONS_LIST = '/performance/registrations'

export const PERFORMANCE_DASHBOARD = '/performance/dashboard'
export const PERFORMANCE_LEADER_BOARDS = '/performance/leaderboards'
export const PERFORMANCE_STATISTICS = '/performance/statistics'

export const TEAM_SEARCH = '/team/search'
export const TEAM_USER_LIST = '/team/users'

export const CREATE_USER = '/createUser'
export const CREATE_USER_ON_LOCATION = '/createUserInLocation/:locationId'
export const CREATE_USER_SECTION = '/createUser/:sectionId/:groupId'
export const REVIEW_USER_FORM = '/user/:userId/:sectionId/:groupId'
export const REVIEW_USER_DETAILS = '/user/:userId/:sectionId/'

export const USER_PROFILE = '/userProfile/:userId'

export const VIEW_RECORD = '/:declarationId/viewRecord'

export const VIEW_VERIFY_CERTIFICATE = '/verify-certificate/:declarationId'
export const ORGANISATIONS_INDEX = '/organisation/:locationId?'

export const OIDP_VERIFICATION_CALLBACK = '/mosip-callback'
