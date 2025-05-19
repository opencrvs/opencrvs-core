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

interface IStyledSelectProps extends Props<ISelectOption> {
  id: string
  error?: boolean
  touched?: boolean
  options: ISelectOption[]
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
  ${({ theme }) => theme.fonts.reg19};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.grey600};
  border-radius: 4px;
  &:hover {
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.grey200};
  }

  .react-select__control {
    height: 46px;
    cursor: pointer;
    border: 1.5px solid
      ${({ error, touched, disabled, theme }) =>
        error && touched
          ? theme.colors.negative
          : disabled
          ? theme.colors.grey300
          : theme.colors.copy};
    &:hover {
      border: 1.5px solid
        ${({ error, touched, disabled, theme }) =>
          error && touched
            ? theme.colors.negative
            : disabled
            ? theme.colors.grey300
            : theme.colors.copy};
      outline: 0.5px solid
        ${({ error, touched, disabled, theme }) =>
          error && touched
            ? theme.colors.negative
            : disabled
            ? theme.colors.grey300
            : theme.colors.copy};
    }
    &:focus {
      outline: 0.5px solid ${({ theme }) => theme.colors.grey600};
      border: 1.5px solid ${({ theme }) => theme.colors.grey600};
      color: ${({ theme }) => theme.colors.grey600};
    }
  }

  .react-select__placeholder {
    color: ${({ theme }) => theme.colors.grey400};
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__control--is-focused {
    outline: 0.5px solid ${({ theme }) => theme.colors.grey600};
    border: 1.5px solid ${({ theme }) => theme.colors.grey600};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.yellow};
  }

  .react-select__control--is-active {
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.yellow};
  }

  .react-select__control--is-disabled {
    background-color: ${({ theme }) => theme.colors.white};
  }

  .react-select__value-container {
    padding: 4px 16px;
  }

  .react-select__option {
    cursor: pointer;
    border-radius: 4px;
    padding: 10px 16px;
    ${({ theme }) => theme.fonts.reg18};
    background-color: ${({ theme }) => theme.colors.white};
  }

  .react-select__option--is-focused {
    background-color: ${({ theme }) => theme.colors.grey50};
    color: ${({ theme }) => theme.colors.copy};
    &:active {
      background: ${({ theme }) => theme.colors.grey100};
      color: ${({ theme }) => theme.colors.copy};
    }
  }
  .react-select__option--is-selected {
    background-color: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.copy};
    &:active {
      background: ${({ theme }) => theme.colors.grey200};
      color: ${({ theme }) => theme.colors.copy};
    }
  }

  .react-select__single-value--is-disabled {
    color: ${({ theme }) => theme.colors.grey500};
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

interface ISelectProps extends Omit<IStyledSelectProps, 'value' | 'onChange'> {
  onChange: (value: string) => void
  value: string
  searchableLength?: number
}

type ControlProps = React.ComponentProps<typeof components.Control>

function CustomControl(props: ControlProps) {
  const { innerProps, selectProps } = props
  return (
    <components.Control
      {...props}
      innerProps={
        {
          ...innerProps,
          'data-testid': selectProps['data-testid']
        } as ControlProps['innerProps'] & { 'data-testid': string }
      }
    />
  )
}

export const Select = (props: ISelectProps) => {
  const { searchableLength, onChange, disabled, options, value, error } = props

  const handleChange = (selectedOption: ISelectOption) => {
    if (onChange) {
      onChange(selectedOption.value)
    }
  }
  const length = searchableLength || 10

  return (
    <StyledSelect
      classNamePrefix="react-select"
      components={{ DropdownIndicator, Control: CustomControl }}
      {...props}
      onChange={handleChange}
      isDisabled={disabled}
      isSearchable={options.length > length}
      value={getSelectedOption(value, options)}
      error={error}
      isOptionDisabled={({ value }: { value: string }) =>
        options.some(
          (option: ISelectOption) => option.value === value && option.disabled
        )
      }
    />
  )
}
