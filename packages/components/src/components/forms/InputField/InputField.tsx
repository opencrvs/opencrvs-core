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
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'
import { colors } from '../../colors'
const InputHeader = styled.div`
  display: flex;
  justify-content: space-between;
`
const ComponentWrapper = styled.span`
  display: flex;
`

const Padding = styled.span`
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.secondary};
`

const PostFixPadding = styled.span`
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.menuBackground};
`

const InputDescription = styled.p<{
  ignoreMediaQuery?: boolean
}>`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

export interface IInputFieldProps {
  id: string
  label?: string
  helperText?: string
  tooltip?: string
  description?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  touched: boolean
  error?: string
  prefix?: string | JSX.Element
  postfix?: string | JSX.Element
  optionalLabel?: string
  children: React.ReactNode
  ignoreMediaQuery?: boolean
  hideAsterisk?: boolean
  hideErrorLabel?: boolean
  hideInputHeader?: boolean
  mode?: THEME_MODE
}

export enum THEME_MODE {
  DARK = 'dark'
}

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const {
      id,
      label,
      helperText,
      tooltip,
      required = true,
      description,
      error,
      touched,
      ignoreMediaQuery,
      hideAsterisk,
      hideErrorLabel,
      hideInputHeader = false,
      mode
    } = this.props

    const postfix = this.props.postfix as React.ComponentClass<any> | string

    const { prefix } = this.props

    let color: string | undefined
    let hideBorder: boolean
    if (mode && mode === THEME_MODE.DARK) {
      color = colors.white
      hideBorder = true
    }
    const children = React.Children.map(
      this.props.children,
      (node: React.ReactElement<any>) => {
        return React.cloneElement(node, { hideBorder })
      }
    )

    return (
      <div id={`${id}-form-input`}>
        {!hideInputHeader && (
          <InputHeader>
            {label && (
              <InputLabel
                id={`${id}_label`}
                inputDescriptor={helperText}
                disabled={this.props.disabled}
                ignoreMediaQuery={ignoreMediaQuery}
                color={color}
                required={required}
                hideAsterisk={hideAsterisk}
                tooltip={tooltip}
              >
                {label}
              </InputLabel>
            )}
          </InputHeader>
        )}

        <ComponentWrapper>
          {prefix && <Padding>{prefix}</Padding>}
          {children}
          {postfix && <PostFixPadding>{postfix}</PostFixPadding>}
        </ComponentWrapper>

        {error && touched && !hideErrorLabel && (
          <InputError
            id={this.props.id + '_error'}
            ignoreMediaQuery={ignoreMediaQuery}
            color={color}
          >
            {error}
          </InputError>
        )}

        {description && (
          <InputDescription ignoreMediaQuery={ignoreMediaQuery} color={color}>
            {description}
          </InputDescription>
        )}
      </div>
    )
  }
}
