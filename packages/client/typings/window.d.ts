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

import { ClientConfig, ApplicationConfig } from '@opencrvs/commons/client'

declare global {
  interface Window {
    config: ApplicationConfig & ClientConfig
    __localeId__: string
    __WB_MANIFEST: Array<{ url: string; revision: string }>
    /**
     * Dev-only helper (only assigned when running in `import.meta.env.DEV`)
     * to force-mint a fresh access token, e.g. to pick up scopes after a
     * role/scope change made server-side without needing to log out.
     */
    __refreshToken?: () => Promise<void>
  }
}
