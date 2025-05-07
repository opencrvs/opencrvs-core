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

import Ajv from 'ajv'
import { ConditionalParameters, JSONSchema } from './conditionals'
import addFormats from 'ajv-formats'

const ajv = new Ajv({
  $data: true
})

// https://ajv.js.org/packages/ajv-formats.html
addFormats(ajv)

export function validate(schema: JSONSchema, data: ConditionalParameters) {
  return ajv.validate(schema, data)
}
