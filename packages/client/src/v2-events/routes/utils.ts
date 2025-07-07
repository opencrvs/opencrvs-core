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

import { parser, type } from 'react-router-typesafe-routes/dom'
import { UUID } from '@opencrvs/commons/client'

/*
 * Without this, the UUIDs in the URLs will have to be wrapped in quotes
 * and URLs look like this:
 * http://localhost:3000/events/overview/"ed3f89c3-2d8c-48a0-9208-f0b000129c4a"
 */
export function uuid<T>() {
  return type((value: unknown) => {
    if (typeof value !== 'string') {
      throw new Error(`Expected a string, but received ${typeof value}`)
    }

    if (value.includes('tmp-')) {
      return value as UUID
    }

    return UUID.parse(value)
  }, parser('string'))
}
