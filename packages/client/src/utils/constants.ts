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
export const EMPTY_STRING = ''

export const LANG_EN = 'en'

export const SECURITY_PIN_EXPIRED_AT = 'locked_time'

export const ALLOWED_IMAGE_TYPE = ['image/jpeg', 'image/jpg', 'image/png']
export const ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE = ['image/svg+xml']

export const ADVANCED_SEARCH_TEXT = 'advanced-search'

const ROLE_FIELD_AGENT = 'FIELD_AGENT'
const ROLE_REGISTRATION_AGENT = 'REGISTRATION_AGENT'
const ROLE_LOCAL_REGISTRAR = 'LOCAL_REGISTRAR'
export const FIELD_AGENT_ROLES = [ROLE_FIELD_AGENT]
export const SYS_ADMIN_ROLES = ['LOCAL_SYSTEM_ADMIN']
export const PERFORMANCE_MANAGEMENT_ROLES = ['PERFORMANCE_MANAGEMENT']
export const NATL_ADMIN_ROLES = ['NATIONAL_SYSTEM_ADMIN']
export const NATIONAL_REGISTRAR_ROLES = ['NATIONAL_REGISTRAR']

export const REGISTRAR_ROLES = [
  ROLE_LOCAL_REGISTRAR,
  'DISTRICT_REGISTRAR',
  'STATE_REGISTRAR',
  ROLE_REGISTRATION_AGENT
]

export const PAGE_TRANSITIONS_CLASSNAME = 'page-transition'

export const PAGE_TRANSITIONS_ENTER_TIME = 500
export const PAGE_TRANSITIONS_EXIT_TIME = PAGE_TRANSITIONS_ENTER_TIME - 10

export const REFRESH_TOKEN_CHECK_MILLIS = 4 * 60 * 1000 // 4 minutes
export const TOKEN_EXPIRE_MILLIS = 10 * 60 * 1000 // 10 minutes

export const AVATAR_API =
  'https://eu.ui-avatars.com/api/?background=DEE5F2&color=222&name='

export const DESKTOP_TIME_OUT_MILLISECONDS = 900000

/** Current application version used in the left navigation. It's saved to localStorage to determine if a user logged into a newer version of the app for the first time */
export const APPLICATION_VERSION = APP_VERSION
export const IS_PROD_ENVIRONMENT = import.meta.env.PROD
