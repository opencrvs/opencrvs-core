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

import React, { useState } from 'react'
import { Text } from '../Text'
import { Button } from '../Button'
import { Icon } from '../Icon'

type copiedValue = string | null
type copyFn = (text: string, time: number | null) => Promise<boolean>

export function useCopyToClipboard(): [copiedValue, copyFn] {
  const [copiedText, setCopiedText] = useState<copiedValue>(null)
  const timeout = React.useRef<null | NodeJS.Timeout>(null)

  const copy: copyFn = async (text, time) => {
    if (!navigator?.clipboard) return false

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      if (!timeout.current && time) {
        timeout.current = setTimeout(() => {
          timeout.current = null
          setCopiedText(null)
        }, time)
      }
      return true
    } catch (error) {
      setCopiedText(null)
      return false
    }
  }

  return [copiedText, copy]
}

export interface ICopyProps extends React.HTMLAttributes<HTMLButtonElement> {
  data: string
  copyLabel: string
  copiedLabel: string
  timeout?: number | null
}

export function CopyButton({
  data,
  copyLabel,
  copiedLabel,
  timeout = 3000,
  ...props
}: ICopyProps) {
  const [clipToCopy, setClipToCopy] = useCopyToClipboard()
  return (
    <Button
      type="tertiary"
      onClick={() => setClipToCopy(data, timeout)}
      {...props}
    >
      {clipToCopy ? (
        <>
          <Icon color="green" name="CheckSquare" />
          <Text variant="bold14" color="green" element="span">
            {copiedLabel}
          </Text>
        </>
      ) : (
        <>
          <Icon name="Copy" />
          <Text variant="bold14" color="blue" element="span">
            {copyLabel}
          </Text>
        </>
      )}
    </Button>
  )
}
