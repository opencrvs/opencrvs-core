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

export const CERTIFICATE_CORRECTION = '/correction/:declarationId/:pageId'

export const VERIFY_CORRECTOR = '/correction/:declarationId/verify/:corrector'

export const SEARCH = '/search'
export const SEARCH_RESULT = '/search-result'
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
export const SYSTEM_LIST = '/config/integration'

export const ALL_USER_EMAIL = '/communications/emailAllUsers'
export const DECLARATION_RECORD_AUDIT = '/record-audit/:tab/:declarationId'

export const PERFORMANCE_HOME = '/performance'
export const ADVANCED_SEARCH = '/advanced-search'
export const ADVANCED_SEARCH_RESULT = '/advanced-search/result'

export const EVENT_COMPLETENESS_RATES =
  '/performance/operations/completenessRates/:eventType'

export const PERFORMANCE_REGISTRATIONS_LIST = '/performance/registrations'

export const DASHBOARD = '/performance/dashboard/:id'

export const TEAM_SEARCH = '/team/search'
export const TEAM_USER_LIST = '/team/users'

export const REVIEW_USER_FORM = '/user/:userId/:sectionId/:groupId'
export const REVIEW_USER_DETAILS = '/user/:userId/:sectionId/'

export const USER_PROFILE = '/userProfile/:userId'

export const VIEW_VERIFY_CERTIFICATE = '/verify-certificate/:declarationId'
export const ORGANISATIONS_INDEX = '/organisation/:locationId?'
