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
import * as React from 'react'
import styled from 'styled-components'

export interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  ignoreMediaQuery?: boolean
  hideBorder?: boolean
  autocomplete?: boolean
  isSmallSized?: boolean
  isDisabled?: boolean
}

export type ITextInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const StyledInput = styled.input<ITextInputProps>`
  width: 100%;
  padding: 8px 10px;
  height: 40px;
  transition: border-color 500ms ease-out;
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ isDisabled, theme }) =>
    isDisabled ? theme.colors.lightGrey : theme.colors.background};

  ${({ hideBorder, error, touched, isDisabled, theme }) =>
    hideBorder
      ? `
      border:none;
      ${
        error && touched
          ? `box-shadow: 0 0 0px 2px ${theme.colors.error};`
          : 'box-shadow: none;'
      }
      &:focus {
        box-shadow: 0 0 0px 2px ${
          error && touched ? theme.colors.error : theme.colors.focus
        };
      }
        `
      : `
      border: 2px solid ${
        error && touched
          ? theme.colors.error
          : isDisabled
          ? theme.colors.greyGrey
          : theme.colors.copy
      };
      &:focus {
        box-shadow: 0 0 0px 3px ${theme.colors.focus};
      }
      `}

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
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

  ${({ ignoreMediaQuery, isSmallSized, theme }) => {
    return !ignoreMediaQuery
      ? isSmallSized
        ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 234px;
      }`
        : `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 535px;
      }`
      : ''
  }}
`

export class TextInput extends React.Component<ITextInputProps> {
  private $element: React.RefObject<HTMLInputElement>
  constructor(props: ITextInputProps, {}) {
    super(props)
    this.$element = React.createRef()
  }
  focusField(): void {
    /*
     * Needs to be run on the next tick
     * so that 'value' prop has enough time to flow back here
     * if the focusInput prop is called right after keydown
     */
    setTimeout(() => {
      if (this.$element.current) {
        this.$element.current!.focus()
      }
    })
  }
  componentDidUpdate(prevProps: ITextInputProps) {
    if (!prevProps.focusInput && this.props.focusInput) {
      this.focusField()
    }
  }

  render() {
    const { focusInput, maxLength = 250, isDisabled, ...props } = this.props

    return (
      <StyledInput
        ref={this.$element}
        name={props.id}
        {...this.props}
        autoComplete={process.env.NODE_ENV === 'production' ? 'off' : undefined}
        maxLength={maxLength}
        disabled={isDisabled}
      />
    )
  }
}
