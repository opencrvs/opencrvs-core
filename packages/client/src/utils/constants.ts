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

export const REFRESH_TOKEN_CHECK_MILLIS = 4 * 60 * 1000 // 4 minutes
export const TOKEN_EXPIRE_MILLIS = 10 * 60 * 1000 // 10 minutes

export const AVATAR_API =
  'https://eu.ui-avatars.com/api/?background=DEE5F2&color=222&name='

export const DESKTOP_TIME_OUT_MILLISECONDS = 900000

/** Current application version used in the left navigation. It's saved to localStorage to determine if a user logged into a newer version of the app for the first time */
export const APPLICATION_VERSION = APP_VERSION

/**
 * Version of the persisted (IndexedDB) TanStack Query cache. Used as the
 * `buster` for the query persister: when it changes, the entire persisted
 * client (queries + mutations) is discarded on restore and refetched fresh.
 *
 * Bump this manually whenever a deploy changes the shape/meaning of cached data
 * or ships a fix that must invalidate stale cache for all users. It is intentionally decoupled from
 * APPLICATION_VERSION so it can be busted on code-only deploys (e.g.
 * beta -> release) that do not bump the package version.
 *
 * WARNING: bumping this discards unsynced mutations (the outbox) too. Only bump
 * as part of an upgrade where staff have been instructed to empty their outbox.
 */
export const CACHE_VERSION = 1
