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
import ReactSelect, { components } from 'react-select'
import styled from 'styled-components'
import { IndicatorProps } from 'react-select/lib/components/indicators'
import { ArrowDownBlue } from '../icons'
import { lightColors } from '../semantics'

export interface ISelect2Option {
  value: string
  label: string
}

export interface ISelect2Props<T extends ISelect2Option = ISelect2Option> {
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
    border-radius: 4px;
    ${({ theme }) => theme.fonts.reg14};
  }

  .react-select__control {
    ${({ defaultWidth }) =>
      defaultWidth ? `min-width: ${defaultWidth}px` : 'min-width: 240px'};
    background-color: ${lightColors['surface/default']};
    justify-content: center;
    min-height: 32px;
    max-height: 32px;
    ${({ theme }) => theme.fonts.bold14};
    text-transform: none;
    border: 2px solid ${lightColors['action/primary']};
    &:hover {
      border: 2px solid ${lightColors['action/primary']};
      background-color: ${lightColors['surface/inset']};
    }
  }

  .react-select__control--is-focused {
    box-shadow: 0 0 0px 3px ${lightColors['feedback/focus']};
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__menu {
    ${({ defaultWidth }) =>
      defaultWidth ? `min-width: ${defaultWidth}` : 'min-width: 160px'};
    ${({ theme }) => theme.fonts.reg14};
  }

  .react-select__option {
    background-color: ${lightColors['surface/default']};
  }

  .react-select__option--is-focused {
    background-color: ${lightColors['surface/inset']};
    color: ${lightColors['text/primary']};
    &:active {
      background: ${lightColors['action/secondaryHover']};
      color: ${lightColors['text/primary']};
    }
  }

  .react-select__option--is-selected {
    background-color: ${lightColors['action/primary']};
    color: ${lightColors['text/onAction']};
    &:active {
      background: ${lightColors['action/primaryHover']};
      color: ${lightColors['text/onAction']};
    }
  }

  .react-select__single-value {
    color: ${lightColors['text/link']};
  }
`

const DropdownIndicator = (props: IndicatorProps<ISelect2Option>) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <ArrowDownBlue />
      </components.DropdownIndicator>
    )
  )
}

function getSelectedOption<T extends ISelect2Option>(
  value: string,
  options: T[]
): T | null {
  const selectedOption = options.find((x: T) => x.value === value)
  if (selectedOption) {
    return selectedOption
  }

  return null
}

export function Select2<T extends ISelect2Option = ISelect2Option>(
  props: ISelect2Props<T>
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
