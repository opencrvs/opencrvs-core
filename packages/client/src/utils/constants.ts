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
export const APPLICATIONS_STATUS = 'applications'
export const REJECTED_STATUS = 'rejected'
export const NOTIFICATION_STATUS = 'notifications'
export const DECLARATION = 'declaration'
export const REGISTRATION = 'registration'
export const CERTIFICATION = 'certificate'
export const DUPLICATION = 'duplication'
export const SUBMISSION = 'submitted'
export const REJECTION = 'rejection'
export const COMPLETION = 'completed'
export const APPROVED = 'approved'
export const REGISTERED = 'registered'
export const EMPTY_STRING = ''
export const APPLICATION_DATE_FORMAT = 'YYYY-MM-DD'
export const CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT = 'DD.MM.YYYY'
export const CERTIFICATE_DATE_FORMAT = 'DD MMMM YYYY'
export const LOCAL_DATE_FORMAT = 'DD-MM-YYYY'
export const BIRTH = 'birth'
export const DEATH = 'death'
export const OFFLINE = 'offline'
export const REJECTED = 'REJECTED'
export const IN_PROGRESS = 'IN_PROGRESS'
export const REJECT_REASON = 'reason'
export const REJECT_COMMENTS = 'comment'
export const DECLARED = 'DECLARED'
export const VALIDATED = 'VALIDATED'
export const LANG_EN = 'en'

export const REGEXP_ALPHA_NUMERIC = '^[0-9a-zA-Z]+$'
export const REGEXP_BLOCK_ALPHA_NUMERIC = '^[0-9A-Z]+$'
export const REGEXP_BLOCK_ALPHA_NUMERIC_DOT = '^[0-9A-Z.]+$'
export const REGEXP_NUMBER_INPUT_NON_NUMERIC = '[eE+-]'
export const REGEXP_DECIMAL_POINT_NUMBER = '\\.'

export const SECURITY_PIN_INDEX = 'pin'
export const SECURITY_PIN_EXPIRED_AT = 'locked_time'

export const ALLOWED_IMAGE_TYPE = ['image/jpeg', 'image/jpg', 'image/png']

export const TRACKING_ID_TEXT = 'tracking-id'
export const BRN_DRN_TEXT = 'brn-drn'
export const PHONE_TEXT = 'phone'
export const NAME_TEXT = 'name'
export const SEARCH_RESULT_SORT = 'DESC'
export const ROLE_FIELD_AGENT = 'FIELD_AGENT'
export const ROLE_REGISTRATION_AGENT = 'REGISTRATION_AGENT'
export const ROLE_LOCAL_REGISTRAR = 'LOCAL_REGISTRAR'
export const FIELD_AGENT_ROLES = [ROLE_FIELD_AGENT]
export const SYS_ADMIN_ROLES = ['LOCAL_SYSTEM_ADMIN']
export const NATL_ADMIN_ROLES = ['NATIONAL_SYSTEM_ADMIN']
export const REGISTRAR_ROLES = [
  ROLE_LOCAL_REGISTRAR,
  'DISTRICT_REGISTRAR',
  'STATE_REGISTRAR',
  'NATIONAL_REGISTRAR',
  ROLE_REGISTRATION_AGENT
]

export const ROLE_TYPE_SECRETARY = 'SECRETARY'
export const ROLE_TYPE_MAYOR = 'MAYOR'
export const ROLE_TYPE_CHAIRMAN = 'CHAIRMAN'

export const FIELD_AGENT_HOME_TAB_IN_PROGRESS = 'progress'
export const FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW = 'review'
export const FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES = 'updates'

export const PERFORMANCE_REPORT_TYPE_MONTHLY = 'monthly'

export const PHONE_NO_FIELD_STRING = 'phoneNo'
export const CONTACT_POINT_FIELD_STRING = 'contactPoint'
export const INFORMANT_FIELD_STRING = 'informantOption'

export const RADIO_BUTTON_LARGE_STRING = 'large'

export const PAGE_TRANSITIONS_CLASSNAME = 'page-transition'
export const PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE = 'ease-in-out both'
export const PAGE_TRANSITIONS_ENTER_TIME = 500
export const PAGE_TRANSITIONS_EXIT_TIME = PAGE_TRANSITIONS_ENTER_TIME - 10

export const JURISDICTION_TYPE: { [key: string]: string } = {
  UNION: 'Union Parishad',
  MUNICIPALITY: 'Municipality',
  CITY_CORPORATION: 'City Corporation',
  UPAZILA: 'Upazila',
  STATE: 'Province',
  DISTRICT: 'District',
  DIVISION: 'Division'
}

export const REFRESH_TOKEN_CHECK_MILLIS = 4 * 60 * 1000 // 4 minutes
export const TOKEN_EXPIRE_MILLIS = 10 * 60 * 1000 // 10 minutes

export const MONTHS_IN_YEAR = 12

export const DECLARED_APPLICATION_SEARCH_QUERY_COUNT =
  process.env.DECLARED_APPLICATION_SEARCH_QUERY_COUNT || 100

export const AVATAR_API = 'https:/eu.ui-avatars.com/api/?name='
