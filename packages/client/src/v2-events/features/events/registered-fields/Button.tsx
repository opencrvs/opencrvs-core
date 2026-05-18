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
import { Icon, Button as UiButton, Text } from '@opencrvs/components'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'
import { ButtonConfiguration } from '@opencrvs/commons/client'
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
  configuration,
  disabled,
  value = 0,
  onChange
}: {
  id: string
  configuration: ButtonConfiguration
  disabled?: boolean
  /** Represents the amount of times the button has been pressed */
  value?: number
  onChange: (amountOfClicks?: number) => void
}) {
  const intl = useIntl()

  const {
    icon,
    loading = false,
    text,
    buttonSize = 'medium',
    buttonType = 'secondary',
    textColor = 'copy',
    textVariant = 'bold14'
  } = configuration

  const handleClick = () => onChange(value + 1)

  return (
    <UiButton
      disabled={disabled}
      id={id}
      loading={loading}
      size={buttonSize}
      type={buttonType}
      onClick={handleClick}
    >
      {icon && !loading && (
        <Icon
          color="currentColor"
          name={throwIfUnsupportedIcon(icon)}
          size="large"
        />
      )}
      <Text color={textColor} element="span" variant={textVariant}>
        {intl.formatMessage(text)}
      </Text>
    </UiButton>
  )
}

export const Button = {
  Input: ButtonInput,
  Output: null
}
