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
import * as Hapi from '@hapi/hapi'

/** Every parameter the token endpoint reads, across both grants. */
const OAUTH_TOKEN_PARAMS = [
  'grant_type',
  'client_id',
  'client_secret',
  'subject_token',
  'subject_token_type',
  'requested_token_type',
  'event_id',
  'action_id'
]

/**
 * Retrieves a parameter from either the request payload or query string.
 * Prioritizes payload over query for POST requests with form data.
 *
 * @deprecated the query string fallback is going away, see
 * {@link deprecatedQueryParams}
 */
export const getParam = (req: Hapi.Request, key: string) =>
  (req.payload as any)?.[key] || req.query[key]

/**
 * OAuth parameters this request passed in the query string, where they leak
 * into access logs and Sentry breadcrumbs (CWE-598). RFC 6749 §2.3.1 requires
 * them in the body. Counted even when the payload also carries them — the URL
 * has already been logged by the time we get here.
 */
export const deprecatedQueryParams = (req: Hapi.Request) =>
  OAUTH_TOKEN_PARAMS.filter((key) => key in req.query)
