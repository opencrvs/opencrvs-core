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

export const HOME = '/'
export const SELECT_VITAL_EVENT = '/events'

export const DRAFT_FORM = `/drafts/:declarationId`
export const DRAFT_FORM_PAGE = `/drafts/:declarationId/:pageId`
export const DRAFT_FORM_PAGE_GROUP = `/drafts/:declarationId/:pageId/group/:groupId`

export const REVIEW_EVENT_PARENT_FORM_PAGE =
  '/reviews/:declarationId/parent/:pageId'

export const REVIEW_EVENT_PARENT_FORM_PAGE_GROUP =
  '/reviews/:declarationId/parent/:pageId/group/:groupId'

export const SEARCH = '/search'
export const SEARCH_RESULT = '/search-result'
export const CERTIFICATE_COLLECTOR =
  '/cert/collector/:registrationId/:eventType/:groupId'

export const REGISTRAR_HOME = '/registration-home'
export const REGISTRAR_HOME_TAB = '/registration-home/:tabId/:selectorId?'
export const REGISTRAR_HOME_TAB_PAGE =
  '/registration-home/:tabId/:selectorId/:pageId'

export const SETTINGS = '/settings'
export const SYSTEM_LIST = '/config/integration'

export const ALL_USER_EMAIL = '/communications/emailAllUsers'

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

export const USER_PROFILE = '/userProfile/:userId'

export const ORGANISATIONS_INDEX = '/organisation/:locationId?'

export const PRINT_RECORD = '/print-record/:declarationId'
