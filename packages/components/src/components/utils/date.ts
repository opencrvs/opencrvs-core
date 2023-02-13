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
function isDate(value: unknown): value is Date {
  return (
    value instanceof Date ||
    (typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Date]')
  )
}

function toDate<DateType extends Date = Date>(
  argument: DateType | number
): DateType {
  const argStr = Object.prototype.toString.call(argument)
  // Clone the date
  if (
    argument instanceof Date ||
    (typeof argument === 'object' && argStr === '[object Date]')
  ) {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: TODO find a way to make TypeScript happy about this code
    return new argument.constructor(argument.getTime())
    // return new Date(argument.getTime())
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    // TODO: Can we get rid of as?
    return new Date(argument) as DateType
  } else {
    // TODO: Can we get rid of as?
    return new Date(NaN) as DateType
  }
}

// date-fns
export default function isValid(dirtyDate: unknown): boolean {
  if (!isDate(dirtyDate) && typeof dirtyDate !== 'number') {
    return false
  }
  const date = toDate(dirtyDate)
  return !isNaN(Number(date))
}
