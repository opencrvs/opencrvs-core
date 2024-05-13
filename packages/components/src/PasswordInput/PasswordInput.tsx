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
import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from '../Button'
import { Icon } from '../Icon'

interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  ignoreVisibility?: boolean
  showIcon?: React.ReactNode
  hideIcon?: React.ReactNode
}

export type IPasswordInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>
const StyledField = styled.div<IPasswordInputProps>`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`
const StyledInput = styled.input<IPasswordInputProps>`
  width: 100%;
  padding: 10px 16px;
  height: 46px;
  border-radius: 4px;
  transition: border-color 500ms ease-out;
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.reg19};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};

  ${({ error, touched, theme }) =>
    `
  border: 1.5px solid ${
    error && touched ? theme.colors.negative : theme.colors.copy
  };
  &:hover {
    box-shadow: 0 0 0px 4px ${theme.colors.grey200};
  } 
  &:focus {
    outline: 0.5px solid ${theme.colors.grey600};
    border: 1.5px solid ${theme.colors.grey600};
    box-shadow: 0 0 0px 4px ${theme.colors.yellow};
  }
  `}

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }

  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }

  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &[maxlength='1'] {
    -moz-appearance: textfield;
    display: block;
    float: left;
    padding: 0;
    text-align: center;
  }
`

const IconButton = styled(Button)`
  margin-right: 8px;
  right: 0;
  position: absolute;
`

export const PasswordInput = ({
  error,
  touched,
  focusInput,
  ignoreVisibility,
  showIcon,
  hideIcon,
  ...props
}: IPasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleVisibility = () => setIsVisible(!isVisible)

  const focusField = () => {
    /*
     * Needs to be run on the next tick
     * so that 'value' prop has enough time to flow back here
     * if the focusInput prop is called right after keydown
     */
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current!.focus()
      }
    })
  }
  useEffect(() => {
    if (focusInput) {
      focusField()
    }
  }, [focusInput])

  return (
    <StyledField>
      <StyledInput
        ref={inputRef}
        {...props}
        type={isVisible ? 'text' : 'password'}
      />
      {!ignoreVisibility && (
        <IconButton size="small" onClick={toggleVisibility} type="icon">
          {isVisible ? (
            hideIcon ? (
              hideIcon
            ) : (
              <Icon name="Eye" size="small" />
            )
          ) : showIcon ? (
            showIcon
          ) : (
            <Icon name="EyeSlash" size="small" />
          )}
        </IconButton>
      )}
    </StyledField>
  )
}
