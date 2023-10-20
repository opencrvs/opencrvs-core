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

import { referenceApi } from '@client/utils/referenceApi'
import * as Handlebars from 'handlebars'

export let handlebarHelpers: Record<string, Handlebars.HelperDelegate>

export async function initHandlebarHelpers() {
  handlebarHelpers = await referenceApi.importHandlebarHelpers()
}

export function registerHandlebarHelpers() {
  if (handlebarHelpers) {
    for (const funcName of Object.keys(handlebarHelpers)) {
      const func = handlebarHelpers[funcName]
      if (typeof func === 'function') {
        Handlebars.registerHelper(funcName, func)
      }
    }
  }
}
