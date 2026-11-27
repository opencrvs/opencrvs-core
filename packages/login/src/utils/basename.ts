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

/**
 * Path that the app is served from, taken from <base href> of the page.
 * <base href> ends with a slash, for example "/login/", but the router matches the base path
 * without it. With "/login/", the address "/login" does not match and the page stays empty.
 */
export function getBasename(baseURI: string): string {
  return new URL(baseURI).pathname.replace(/\/$/, '') || '/'
}
