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

import {
  FieldConfig,
  flag,
  isNonInteractiveFieldType,
  PageConfig
} from '@opencrvs/toolkit/events'

/**
 * Secures a field for as long as the record carries the `sealed` flag. Fields
 * that are already secured - unconditionally or by a condition of their own -
 * are left alone, as are fields that hold no data.
 */
function secureFieldWhileSealed(field: FieldConfig): FieldConfig {
  if (isNonInteractiveFieldType(field) || field.secured) {
    return field
  }

  return { ...field, secured: flag('sealed') }
}

/**
 * Secures every data-carrying field of a declaration page while the record is
 * sealed.
 *
 * Sealing hides a record from everyone without the sealed read scope, but a
 * user can still hold a `record.search` scope that returns sealed records -
 * that is what makes the masked "search but not view" state possible. The
 * search index is redacted of secured fields only, so any declaration field
 * left unsecured is readable by exactly the users the seal is meant to keep
 * out (opencrvs-core#13289). Applying this to the whole form keeps that true
 * for fields added later, instead of relying on each one remembering to
 * declare `secured`.
 */
export function securePageWhileSealed<T extends PageConfig>(page: T): T {
  return { ...page, fields: page.fields.map(secureFieldWhileSealed) }
}
