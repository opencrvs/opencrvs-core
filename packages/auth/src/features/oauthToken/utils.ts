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
 * Retrieves a parameter from the request payload.
 *
 * The query string is deliberately not read: RFC 6749 §2.3.1 requires the
 * parameters in the body, and a secret in a URL ends up in access logs.
 */
export const getParam = (req: Hapi.Request, key: string) =>
  (req.payload as any)?.[key]
