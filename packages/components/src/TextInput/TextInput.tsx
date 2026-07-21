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
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'
import { primitives } from '../primitives'

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

  ${({ error, touched, disabled }) => `
    border: 1.5px solid ${
      error && touched
        ? lightColors['feedback/negative']
        : disabled
        ? lightColors['border/strong']
        : lightColors['text/primary']
    };
    &:hover {
      box-shadow: 0 0 0 4px ${lightColors['border/default']};
    }
    &:focus-within {
      outline: 0.5px solid ${primitives.grey[900]};
      border: 1.5px solid ${primitives.grey[900]};
      box-shadow: 0 0 0px 4px ${lightColors['feedback/focus']};
    }
  `}
`

const StyledPrefix = styled.span`
  ${({ theme }) => theme.fonts.reg19};
  color: ${lightColors['text/disabled']};
  user-select: none;
`

const StyledPostfix = styled.span`
  ${({ theme }) => theme.fonts.reg19};
  color: ${lightColors['text/disabled']};
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
  color: ${({ disabled }) =>
    disabled ? lightColors['text/tertiary'] : lightColors['text/primary']};
  background: ${lightColors['surface/default']};

  &::-webkit-input-placeholder {
    color: ${lightColors['text/tertiary']};
  }

  &::-moz-placeholder {
    color: ${lightColors['text/tertiary']};
  }

  &:-ms-input-placeholder {
    color: ${lightColors['text/tertiary']};
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
