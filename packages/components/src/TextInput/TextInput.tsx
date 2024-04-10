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
  hideBorder?: boolean
  autocomplete?: boolean
  isSmallSized?: boolean
  isDisabled?: boolean
  hasPrefix?: boolean // Declare hasPrefix prop
  hasPostfix?: boolean // Declare hasPostfix prop
  prefix?: React.ReactNode | string
  postfix?: React.ReactNode | string
  unit?: React.ReactNode | string
}

export type ITextInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const StyledInputContainer = styled.div`
  position: relative;
  width: 100%;
`

const StyledPrefix = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  ${({ theme }) => theme.fonts.reg19};
  color: ${({ theme }) => theme.colors.grey400};
`

const StyledPostfix = styled.span`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  ${({ theme }) => theme.fonts.reg19};
  color: ${({ theme }) => theme.colors.grey400};
`

const StyledInput = styled.input<ICustomProps>`
  width: 100%;
  padding-left: ${({ hasPrefix }) => (hasPrefix ? '48px' : '16px')};
  padding-right: ${({ hasPostfix }) => (hasPostfix ? '4px' : '16px')};
  height: 46px;
  border-radius: 4px;
  transition: border-color 500ms ease-out;
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.reg19};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};

  ${({ error, touched, disabled, theme }) => `
    border: 1px solid ${
      error && touched
        ? theme.colors.negative
        : disabled
        ? theme.colors.grey300
        : theme.colors.copy
    };

    &:hover {
      box-shadow: 0 0 0 4px ${theme.colors.primaryLight};
    }

    &:focus {
      outline: 1px solid ${theme.colors.grey600};
      border: 1px solid ${theme.colors.grey600};
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

export interface IRef {
  focusField: () => void
}

export const TextInput = React.forwardRef<IRef, ITextInputProps>(
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
    const $element = React.useRef<HTMLInputElement>(null)

    function focusField(): void {
      /*
       * Needs to be run on the next tick
       * so that 'value' prop has enough time to flow back here
       * if the focusInput prop is called right after keydown
       */
      setTimeout(() => {
        if ($element.current) {
          $element.current.focus()
        }
      })
    }

    React.useImperativeHandle(ref, () => ({
      focusField
    }))

    React.useEffect(() => {
      if (focusInput) {
        focusField()
      }
    }, [focusInput])

    return (
      <StyledInputContainer>
        {prefix && <StyledPrefix>{prefix}</StyledPrefix>}
        <StyledInput
          ref={$element}
          name={otherProps.id}
          {...otherProps}
          autoComplete={
            process.env.NODE_ENV === 'production' ? 'off' : undefined
          }
          maxLength={maxLength}
          disabled={isDisabled}
          error={error}
          hasPrefix={!!prefix} /* Passes whether prefix exists */
          hasPostfix={!!postfix} /* Passes whether postfix exists */
        />
        {postfix && <StyledPostfix>{postfix}</StyledPostfix>}
        {unit && <StyledPostfix>{unit}</StyledPostfix>}
      </StyledInputContainer>
    )
  }
)

TextInput.displayName = 'TextInput'
