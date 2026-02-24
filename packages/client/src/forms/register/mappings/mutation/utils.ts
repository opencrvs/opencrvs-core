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


/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function stripTypename(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripTypename)
  } else if (obj !== null && typeof obj === 'object') {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const newObj: any = {}
    for (const key in obj) {
      if (key !== '__typename' && Object.hasOwn(obj, key)) {
        newObj[key] = stripTypename(obj[key])
      }
    }
    return newObj
  }
  return obj
}
