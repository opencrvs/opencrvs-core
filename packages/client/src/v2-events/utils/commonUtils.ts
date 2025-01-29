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

export function isMobileDevice() {
  const IS_MOBILE = true
  const IS_DESKTOP = false

  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return IS_MOBILE
  }

  if (window.outerWidth < 1033) {
    return IS_MOBILE
  }

  return IS_DESKTOP
}

export function isBase64FileString(str: string) {
  if (str === '' || str.trim() === '') {
    return false
  }
  const strSplit = str.split(':')
  return strSplit.length > 0 && strSplit[0] === 'data'
}
