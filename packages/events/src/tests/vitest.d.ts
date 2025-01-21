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

export type { ProvidedContext } from 'vitest'

declare module 'vitest' {
  export interface ProvidedContext {
    EVENTS_MONGO_URI: string
    USER_MGNT_MONGO_URI: string
    ELASTICSEARCH_URI: string
  }
}
