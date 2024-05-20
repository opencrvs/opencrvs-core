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
import { TextInput } from '../TextInput'
import { Icon } from '../Icon'
import { CircleButton } from '../buttons'

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  touched?: boolean
  ignoreVisibility?: boolean
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  ignoreVisibility,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsVisible(!isVisible)
  }

  return (
    <TextInput
      {...props}
      type={isVisible ? 'text' : 'password'}
      postfix={
        !ignoreVisibility && (
          <CircleButton onClick={toggleVisibility} type="button" size="medium">
            <Icon name={isVisible ? 'Eye' : 'EyeSlash'} size="small" />
          </CircleButton>
        )
      }
    />
  )
}
