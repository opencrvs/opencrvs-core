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
import { IndicatorProps } from 'react-select/lib/components/indicators'
import { isEqual } from 'lodash'
import { Icon } from '@opencrvs/components'
import { Option } from '@client/v2-events/utils'

/* Based on components/Select.tsx */

export interface StyledSelectProps extends Props<Option> {
  id: string
  error?: boolean
  touched?: boolean
  options: Option[]
  placeholder?: string
}

function DropdownIndicator(props: IndicatorProps<Option>) {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <Icon color="grey600" name="CaretDown" size="small" />
      </components.DropdownIndicator>
    )
  )
}

const StyledSelect = styled(ReactSelect)<StyledSelectProps>`
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
        /* eslint-disable no-nested-ternary */
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

function getSelectedOption<T>(
  value: T,
  options: Option<T>[]
): Option<T> | null {
  const selectedOption = options.find((option) => isEqual(option.value, value))

  return selectedOption ?? null
}

export interface SelectProps<T>
  extends Omit<StyledSelectProps, 'value' | 'onChange' | 'options'> {
  searchableLength?: number
  onChange: (option: Option<T>) => void
  options: Option<T>[]
  value: T | undefined
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

export function Select<T>({
  onChange,
  searchableLength = 10,
  error,
  disabled,
  options,
  value,
  ...props
}: SelectProps<T>) {
  const valueFromOptions = getSelectedOption(value, options)

  return (
    <StyledSelect
      classNamePrefix="react-select"
      components={{ DropdownIndicator, Control: CustomControl }}
      error={error}
      isDisabled={disabled}
      isSearchable={options.length > length}
      options={options}
      value={valueFromOptions}
      onChange={onChange}
      {...props}
    />
  )
}
