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

import { z } from 'zod'

export const SystemRole = z.enum([
  'HEALTH',
  'NATIONAL_ID',
  'RECORD_SEARCH',
  'IMPORT',
  'REINDEX',
  'WEBHOOK',
  'IMPORT_EXPORT'
])

export const REINDEX_USER_ID = '__ANONYMOUS_REINDEX_USER__'

export type SystemRole = z.infer<typeof SystemRole>
