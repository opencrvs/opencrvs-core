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
import ReactSelect, { components } from 'react-select'
import styled from 'styled-components'
import { IndicatorProps } from 'react-select/lib/components/indicators'
import { KeyboardArrowDown } from '../icons'

export interface ISelectOption {
  value: string
  label: string
}

export interface ISelectProps<T extends ISelectOption = ISelectOption> {
  id?: string
  value: string
  options: T[]
  withLightTheme?: boolean
  onChange?: (selectedOption: T) => void
  defaultWidth?: number
}

const StyledSelect = styled(ReactSelect)<{
  defaultWidth: number
  withLightTheme: boolean
}>`
  .react-select__container {
    border-radius: 2px;
    ${({ theme }) => theme.fonts.reg14};
  }

  .react-select__control {
    ${({ defaultWidth }) =>
      defaultWidth ? `min-width: ${defaultWidth}px` : 'min-width: 160px'};
    background-color: ${({ theme, withLightTheme }) =>
      withLightTheme ? theme.colors.white : theme.colors.secondary} !important;
    justify-content: center;
    ${({ theme }) => theme.fonts.reg14};
    text-transform: none;
    min-height: 32px;
    max-height: 32px;
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    &:hover {
      border: 2px solid ${({ theme }) => theme.colors.secondary};
      ${({ theme, withLightTheme }) =>
        withLightTheme ? theme.colors.grey200 : theme.colors.grey400}
    }
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__indicator {
    height: 28px;
    min-height: 28px;
  }

  .react-select__dropdown-indicator {
    padding-top: 2px;
    & > svg > path {
      color: ${({ theme, withLightTheme }) =>
        withLightTheme ? theme.colors.primary : theme.colors.white};
    }
  }

  .react-select__menu {
    ${({ defaultWidth }) =>
      defaultWidth ? `min-width: ${defaultWidth}` : 'min-width: 160px'};
    ${({ theme }) => theme.fonts.reg14};
  }

  .react-select__single-value {
    color: ${({ theme, withLightTheme }) =>
      withLightTheme ? theme.colors.primary : theme.colors.white};
    margin-top: -1px;
  }
  .react-select__control--is-focused {
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.yellow};
  }
`

const DropdownIndicator = (props: IndicatorProps<ISelectOption>) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <KeyboardArrowDown />
      </components.DropdownIndicator>
    )
  )
}

function getSelectedOption<T extends ISelectOption>(
  value: string,
  options: T[]
): T | null {
  const selectedOption = options.find((x: T) => x.value === value)
  if (selectedOption) {
    return selectedOption
  }

  return null
}

export function Select<T extends ISelectOption = ISelectOption>(
  props: ISelectProps<T>
) {
  function handleChange(item: T) {
    if (props.onChange) {
      props.onChange(item)
    }
  }

  const selectedOption: T = getSelectedOption<T>(
    props.value,
    props.options
  ) as T

  return (
    <StyledSelect
      id={props.id}
      isSearchable={false}
      value={getSelectedOption(props.value, props.options)}
      classNamePrefix="react-select"
      components={{ DropdownIndicator }}
      options={props.options}
      onChange={handleChange}
      defaultWidth={
        props.defaultWidth || selectedOption.label.trim().length * 8 + 50
      }
      withLightTheme={props.withLightTheme || false}
    />
  )
}
