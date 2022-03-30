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
import { default as ReactSelect, components } from 'react-select'
import styled from 'styled-components'
import { Props } from 'react-select/lib/Select'
import { Omit } from '../omit'
import { ArrowDownBlue } from '../icons'
import { IndicatorProps } from 'react-select/lib/components/indicators'

export interface ISelectOption {
  value: string
  label: string
}

export interface IStyledSelectProps extends Props<ISelectOption> {
  id: string
  error?: boolean
  touched?: boolean
  hideBorder?: boolean
  options: ISelectOption[]
  ignoreMediaQuery?: boolean
  color?: string
  placeholder?: string
}

const DropdownIndicator = (props: IndicatorProps<ISelectOption>) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <ArrowDownBlue />
      </components.DropdownIndicator>
    )
  )
}

const StyledSelect = styled(ReactSelect)<IStyledSelectProps>`
  width: 100%;

  ${({ theme }) => theme.fonts.reg16};
  .react-select__control {
    background: ${({ theme, color }) =>
      color ? color : theme.colors.background};
    border-radius: 0;
    height: 40px;
    box-shadow: none;
    ${({ theme }) => theme.fonts.reg16};
    padding: 0 8px;
    border: solid ${({ hideBorder }) => (hideBorder ? '0px' : '2px')};
    ${({ error, touched, theme }) =>
      error && touched ? theme.colors.negative : theme.colors.copy};
    &:hover {
      border: solid ${({ hideBorder }) => (hideBorder ? '0px' : '2px')};
      ${({ error, touched, theme }) =>
        error && touched ? theme.colors.negative : theme.colors.copy};
    }
    &:focus {
      outline: none;
    }
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__control--is-focused {
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.yellow};
    border: solid ${({ hideBorder }) => (hideBorder ? '0px' : '2px')};
    ${({ theme }) => theme.colors.copy};
  }

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 344px;
      }`
      : ''
  }}

  .react-select__value-container {
    padding: 0;
  }
`

function getSelectedOption(
  value: string,
  options: ISelectOption[]
): ISelectOption | null {
  const selectedOption = options.find((x: ISelectOption) => x.value === value)
  if (selectedOption) {
    return selectedOption
  }

  return null
}

export interface ISelectProps
  extends Omit<IStyledSelectProps, 'value' | 'onChange'> {
  onChange: (value: string) => void
  value: string
  color?: string
  searchableLength?: number
}

export class Select extends React.Component<ISelectProps> {
  change = (selectedOption: ISelectOption) => {
    if (this.props.onChange) {
      this.props.onChange(selectedOption.value)
    }
  }
  render() {
    const length = this.props.searchableLength || 10

    return (
      <StyledSelect
        classNamePrefix="react-select"
        components={{ DropdownIndicator }}
        {...this.props}
        onChange={this.change}
        isSearchable={this.props.options.length > length}
        value={getSelectedOption(this.props.value, this.props.options)}
      />
    )
  }
}
