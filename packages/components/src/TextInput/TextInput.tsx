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
import * as React from 'react'
import styled from 'styled-components'

export interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  hideBorder?: boolean // Deprecated
  autocomplete?: boolean
  isSmallSized?: boolean // Deprecated
  isDisabled?: boolean
  hasPrefix?: boolean
  hasPostfix?: boolean
  prefix?: React.ReactNode | string
  postfix?: React.ReactNode | string
  unit?: React.ReactNode | string
}

export type ITextInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const StyledInputContainer = styled.div<{
  touched?: boolean
  disabled?: boolean
  error?: boolean
}>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  border-radius: 4px;
  transition: border-color 500ms ease-out;
  box-sizing: border-box;
  overflow: hidden;

  ${({ error, touched, disabled, theme }) => `
    border: 1.5px solid ${
      error && touched
        ? theme.colors.negative
        : disabled
        ? theme.colors.grey300
        : theme.colors.copy
    };
    &:hover {
      box-shadow: 0 0 0 4px ${theme.colors.grey200};
    }
    &:focus-within {
      outline: 0.5px solid ${theme.colors.grey600};
      border: 1.5px solid ${theme.colors.grey600};
      box-shadow: 0 0 0px 4px ${theme.colors.yellow};
    }
  `}
`

const StyledPrefix = styled.span`
  ${({ theme }) => theme.fonts.reg19};
  color: ${({ theme }) => theme.colors.grey400};
  user-select: none;
`

const StyledPostfix = styled.span`
  ${({ theme }) => theme.fonts.reg19};
  color: ${({ theme }) => theme.colors.grey400};
  user-select: none;
`

const StyledInput = styled.input<ICustomProps>`
  width: 100%;
  padding-left: ${({ hasPrefix }) => (hasPrefix ? '8px' : '0')};
  padding-right: ${({ hasPostfix }) => (hasPostfix ? '4px' : '0')};
  height: 46px;
  outline: none;
  border: none;
  ${({ theme }) => theme.fonts.reg19};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};

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

export const TextInput = React.forwardRef<HTMLInputElement, ITextInputProps>(
  (
    {
      focusInput,
      maxLength = 250,
      isDisabled,
      error,
      postfix,
      prefix,
      unit,
      ...otherProps
    },
    ref
  ) => {
    return (
      <StyledInputContainer
        touched={otherProps.touched}
        disabled={isDisabled}
        error={error}
      >
        {prefix && <StyledPrefix>{prefix}</StyledPrefix>}
        <StyledInput
          ref={ref}
          autoFocus={focusInput}
          name={otherProps.id}
          {...otherProps}
          autoComplete={
            process.env.NODE_ENV === 'production' ? 'off' : undefined
          }
          maxLength={maxLength}
          disabled={isDisabled}
          error={error}
          hasPrefix={!!prefix}
          hasPostfix={!!postfix}
        />
        {postfix && <StyledPostfix>{postfix}</StyledPostfix>}
        {unit && <StyledPostfix>{unit}</StyledPostfix>}
      </StyledInputContainer>
    )
  }
)

TextInput.displayName = 'TextInput'
