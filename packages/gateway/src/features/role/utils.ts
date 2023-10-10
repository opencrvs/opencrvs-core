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
export interface IComparisonObject {
  eq?: string
  gt?: string
  lt?: string
  gte?: string
  lte?: string
  in?: string[]
  ne?: string
  nin?: string[]
}

export interface IMongoComparisonObject {
  $eq?: string
  $gt?: string
  $lt?: string
  $gte?: string
  $lte?: string
  $in?: string[]
  $ne?: string
  $nin?: string[]
}

export function transformMongoComparisonObject(
  obj: IComparisonObject
): IMongoComparisonObject | {} {
  const keys = Object.keys(obj)
  if (!keys.length) {
    return obj
  }

  return Object.keys(obj).reduce(
    (result, key) => ({
      ...result,
      [`$${key}`]: obj[key as keyof IComparisonObject]
    }),
    {}
  )
}
