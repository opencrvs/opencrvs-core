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

/**
 * Retrieves a parameter from the request payload. The query string is not
 * consulted: RFC 6749 §2.3.1 requires token endpoint parameters to be sent in
 * the body, and credentials in a URL leak into logs (CWE-598).
 */
export const getParam = (req: Hapi.Request, key: string) =>
  (req.payload as any)?.[key]
