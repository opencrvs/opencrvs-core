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
import { default as ReactSelect, components } from 'react-select'
import styled from 'styled-components'
import { Props } from 'react-select/lib/Select'
import { Icon } from '../Icon'

import { IndicatorProps } from 'react-select/lib/components/indicators'

export interface ISelectOption {
  value: string
  label: string
  disabled?: boolean
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
        <Icon name="CaretDown" size="small" color="grey600" />
      </components.DropdownIndicator>
    )
  )
}

const StyledSelect = styled(ReactSelect)<IStyledSelectProps>`
  width: 100%;
  ${({ theme }) => theme.fonts.reg18};
  .react-select__control {
    background: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    height: 40px;
    box-shadow: none;
    padding: 0 0 0 8px;
    border: solid
      ${({ theme, isDisabled }) =>
        isDisabled ? theme.colors.grey300 : theme.colors.copy}
      ${({ hideBorder }) => (hideBorder ? '0px' : '2px')};
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

  .react-select__placeholder {
    color: ${({ theme }) => theme.colors.grey400};
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

  .react-select__option {
    border-radius: 4px;
    margin-bottom: 2px;
    ${({ theme }) => theme.fonts.reg16};
    background-color: ${({ theme }) => theme.colors.white};
  }

  .react-select__option--is-focused {
    background-color: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.copy};
    &:active {
      background: ${({ theme }) => theme.colors.grey200};
      color: ${({ theme }) => theme.colors.copy};
    }
  }

  .react-select__option--is-selected {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
    &:active {
      background: ${({ theme }) => theme.colors.secondary};
      color: ${({ theme }) => theme.colors.white};
    }
  }

  .react-select__single-value--is-disabled {
    color: ${({ theme }) => theme.colors.copy};
  }

  .react-select__menu {
    z-index: 2;
    padding: 0px 4px;
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
        isDisabled={this.props.disabled}
        isSearchable={this.props.options.length > length}
        value={getSelectedOption(this.props.value, this.props.options)}
        isOptionDisabled={({ value }: { value: string }) =>
          this.props.options.some(
            (option: ISelectOption) => option.value === value && option.disabled
          )
        }
      />
    )
  }
}
