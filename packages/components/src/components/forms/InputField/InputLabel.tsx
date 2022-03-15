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
import ReactTooltip from 'react-tooltip'
import { InputDescriptor } from './InputDescriptor'

export type IInputLabel = {
  inputDescriptor?: string
  disabled?: boolean
  ignoreMediaQuery?: boolean
  color?: string
  required?: boolean
  hideAsterisk?: boolean
  tooltip?: string
} & React.LabelHTMLAttributes<HTMLLabelElement>

const StyledInputLabel = styled.label<IInputLabel>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ color, disabled, theme }) =>
    disabled ? theme.colors.grey400 : color ? color : theme.colors.copy};
  width: 100%;
  margin-bottom: 5px;
  display: inline-block;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 615px;
      }`
      : ''
  }}
`

const Required = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.grey400 : theme.colors.negative};
  flex-grow: 0;
`

const ToolTipContainer = styled.span`
  text-align: center;
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    const { inputDescriptor, required, hideAsterisk, children, tooltip } =
      this.props
    return (
      <StyledInputLabel data-tip={tooltip} {...this.props}>
        {tooltip && <ReactTooltip />}
        {children}
        {required && !hideAsterisk && (
          <Required disabled={this.props.disabled}>&nbsp;*</Required>
        )}
        {inputDescriptor && (
          <InputDescriptor>{inputDescriptor}</InputDescriptor>
        )}
      </StyledInputLabel>
    )
  }
}
