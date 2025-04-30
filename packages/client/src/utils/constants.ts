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
export const REGISTERED = 'registered'
export const CERTIFIED = 'certified'
export const ISSUED = 'issued'
export const EMPTY_STRING = ''
export const REJECTED = 'REJECTED'
export const IN_PROGRESS = 'IN_PROGRESS'
export const DECLARED = 'DECLARED'
export const VALIDATED = 'VALIDATED'
export const ARCHIVED = 'ARCHIVED'
export const LANG_EN = 'en'

export const REGEXP_BLOCK_ALPHA_NUMERIC_DOT = '^[0-9A-Z.]+$'
export const REGEXP_NUMBER_INPUT_NON_NUMERIC = '[eE+-]'
export const REGEXP_DECIMAL_POINT_NUMBER = '\\.'

export const SECURITY_PIN_EXPIRED_AT = 'locked_time'

export const ALLOWED_IMAGE_TYPE = ['image/jpeg', 'image/jpg', 'image/png']
export const ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE = ['image/svg+xml']

export const ADVANCED_SEARCH_TEXT = 'advanced-search'
export const SEARCH_RESULT_SORT = 'DESC'
export const NATIONAL_ID = 'NATIONAL_ID'

export const BIRTH_REGISTRATION_NUMBER = 'BIRTH_REGISTRATION_NUMBER'
export const DEATH_REGISTRATION_NUMBER = 'DEATH_REGISTRATION_NUMBER'

export const MARRIAGE_SIGNATURE_KEYS = [
  'groomSignature',
  'brideSignature',
  'witnessOneSignature',
  'witnessTwoSignature'
] as const

export const SIGNATURE_KEYS = [
  ...MARRIAGE_SIGNATURE_KEYS,
  'informantsSignature'
] as const

export const SYNC_WORKQUEUE_TIME = 500
export const REFRESH_TOKEN_CHECK_MILLIS = 4 * 60 * 1000 // 4 minutes
export const TOKEN_EXPIRE_MILLIS = 10 * 60 * 1000 // 10 minutes

export const AVATAR_API =
  'https://eu.ui-avatars.com/api/?background=DEE5F2&color=222&name='
export const ACCUMULATED_FILE_SIZE = 20480000

export const DESKTOP_TIME_OUT_MILLISECONDS = 900000

/** Current application version used in the left navigation. It's saved to localStorage to determine if a user logged into a newer version of the app for the first time */
export const APPLICATION_VERSION = APP_VERSION
export const IS_PROD_ENVIRONMENT = import.meta.env.PROD
