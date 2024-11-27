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

// eslint-disable-next-line import/no-relative-parent-imports
import { Bundle, Saved } from '@opencrvs/commons/types'

export default class RecordsAPI {
  private cachedRecord: Saved<Bundle> | null = null

  setRecord(record: Saved<Bundle>) {
    this.cachedRecord = record
  }
  getRecord() {
    if (!this.cachedRecord) {
      throw new Error(
        'Context record has not been set. This should never happen.'
      )
    }
    return this.cachedRecord!
  }
  fetchRecord() {
    return this.cachedRecord
  }
}
