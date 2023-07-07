/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { Validation } from '@client/utils/validate'
import { referenceApi } from '@client/utils/referenceApi'
import { AnyFn } from '@client/forms/mappings/deserializer'
import * as builtInValidators from '@client/utils/validate'

export type Validator = Validation | AnyFn<Validation>
export let validators: Record<string, Validator>

export async function initValidators() {
  const countryConfigValidators = await referenceApi.importValidators()
  validators = {
    // Needs to be casted as any as there are non-validator functions in the import
    ...(builtInValidators as Record<string, any>),
    ...countryConfigValidators
  }
}
