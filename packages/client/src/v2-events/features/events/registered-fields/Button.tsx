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

import React from 'react'
import { useIntl } from 'react-intl'
import { Icon, Button as UiButton } from '@opencrvs/components'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'
import { TranslationConfig } from '@opencrvs/commons/client'

export function throwIfUnsupportedIcon(icon: string) {
  if (icon in SupportedIcons) {
    return icon as keyof typeof SupportedIcons
  }

  throw new Error(
    `Unsupported icon in FieldType.BUTTON: ${icon}. Please use one of the supported icons from @opencrvs/components`
  )
}

function ButtonInput({
  id,
  configuration: { icon, loading = false, text },
  disabled,
  value = 0,
  onChange
}: {
  id: string
  configuration: {
    icon?: string
    loading?: boolean
    text: TranslationConfig
  }
  disabled?: boolean
  /** Represents the amount of times the button has been pressed */
  value?: number
  onChange: (amountOfClicks?: number) => void
}) {
  const intl = useIntl()

  const handleClick = () => onChange(value + 1)

  return (
    <UiButton
      disabled={disabled}
      id={id}
      loading={loading}
      type="secondary"
      onClick={handleClick}
    >
      {icon && !loading && (
        <Icon
          color="currentColor"
          name={throwIfUnsupportedIcon(icon)}
          size="large"
        />
      )}
      {intl.formatMessage(text)}
    </UiButton>
  )
}

export const Button = {
  Input: ButtonInput,
  Output: null
}
