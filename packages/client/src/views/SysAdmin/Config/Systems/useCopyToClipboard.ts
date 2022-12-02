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

import { useState } from 'react'

type copiedValue = string | null
type copyFn = (text: string) => Promise<boolean>

export function useCopyToClipboard(): [copiedValue, copyFn] {
  const [copiedText, setCopiedText] = useState<copiedValue>(null)

  const copy: copyFn = async (text) => {
    if (!navigator?.clipboard) return false

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      return true
    } catch (error) {
      setCopiedText(null)
      return false
    }
  }

  return [copiedText, copy]
}
