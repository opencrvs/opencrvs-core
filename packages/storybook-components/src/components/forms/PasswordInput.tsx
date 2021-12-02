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
import { EyeOn, EyeOff } from '../icons'
import { TertiaryButton, CircleButton } from '../buttons'

interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  ignoreMediaQuery?: boolean
  hideBorder?: boolean
  ignoreVisibility?: boolean
  showIcon?: React.ReactNode
  hideIcon?: React.ReactNode
}

interface IPasswordInputState {
  isVisible: boolean
}

export type IPasswordInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>
const StyledField = styled.div<IPasswordInputProps>`
  width: 100%;
  display: flex;
  align-items: center;
`
const StyledInput = styled.input<IPasswordInputProps>`
  width: 100%;
  padding: 8px 10px;
  height: 40px;
  transition: border-color 500ms ease-out;
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.background};

  ${({ hideBorder, error, touched, theme }) =>
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
        error && touched ? theme.colors.error : theme.colors.copy
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

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

const IconButton = styled(props => <CircleButton {...props} />)`
  height: 32px;
  width: 32px;
  margin-right: 4px;
  padding: 0px 4px;
  right: 0;
  position: absolute;
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.background};
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    outline: none;
    color: ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.background};
  }
  &:active:not([data-focus-visible-added]) {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
`

export class PasswordInput extends React.Component<
  IPasswordInputProps,
  IPasswordInputState
> {
  private $element: React.RefObject<HTMLInputElement>
  constructor(props: IPasswordInputProps) {
    super(props)
    this.$element = React.createRef()
    this.state = {
      isVisible: false
    }
    this.toggleVisibility = this.toggleVisibility.bind(this)
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
  componentDidUpdate(prevProps: IPasswordInputProps) {
    if (!prevProps.focusInput && this.props.focusInput) {
      this.focusField()
    }
  }
  toggleVisibility() {
    this.setState({
      isVisible: !this.state.isVisible
    })
  }

  render() {
    const { showIcon, hideIcon, ignoreVisibility } = this.props
    return (
      <StyledField>
        <StyledInput
          ref={this.$element}
          {...this.props}
          type={this.state.isVisible ? 'text' : 'password'}
        />
        {!ignoreVisibility && (
          <IconButton onClick={this.toggleVisibility} type="button">
            {this.state.isVisible ? (
              hideIcon ? (
                hideIcon
              ) : (
                <EyeOn />
              )
            ) : showIcon ? (
              showIcon
            ) : (
              <EyeOff />
            )}
          </IconButton>
        )}
      </StyledField>
    )
  }
}
