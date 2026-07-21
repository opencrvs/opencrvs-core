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
import { lightColors } from '../semantics'

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
  background: ${lightColors['surface/default']};
  color: ${lightColors['text/primary']};
  border-radius: 4px;
  &:hover {
    box-shadow: 0 0 0 4px ${lightColors['border/default']};
  }

  .react-select__control {
    height: 48px;
    cursor: pointer;
    border: 1.5px solid
      ${({ error, touched, disabled }) =>
        error && touched
          ? lightColors['feedback/negative']
          : disabled
            ? lightColors['border/strong']
            : lightColors['text/primary']};
    &:hover {
      border: 1.5px solid
        ${({ error, touched, disabled }) =>
          error && touched
            ? lightColors['feedback/negative']
            : disabled
              ? lightColors['border/strong']
              : lightColors['text/primary']};
      outline: 0.5px solid
        ${({ error, touched, disabled }) =>
          error && touched
            ? lightColors['feedback/negative']
            : disabled
              ? lightColors['border/strong']
              : lightColors['text/primary']};
    }
    &:focus {
      outline: 0.5px solid ${lightColors['border/emphasis']};
      border: 1.5px solid ${lightColors['border/emphasis']};
      color: ${lightColors['text/primary']};
    }
  }

  .react-select__placeholder {
    color: ${lightColors['text/disabled']};
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__control--is-focused {
    outline: 0.5px solid ${lightColors['border/emphasis']};
    border: 1.5px solid ${lightColors['border/emphasis']};
    box-shadow: 0 0 0 4px ${lightColors['feedback/focus']};
  }

  .react-select__control--is-active {
    box-shadow: 0 0 0 4px ${lightColors['feedback/focus']};
  }

  .react-select__control--is-disabled {
    background-color: ${lightColors['surface/default']};
  }

  .react-select__value-container {
    padding: 4px 16px;
  }

  .react-select__option {
    cursor: pointer;
    border-radius: 4px;
    padding: 10px 16px;
    ${({ theme }) => theme.fonts.reg18};
    background-color: ${lightColors['surface/default']};
  }

  .react-select__option--is-focused {
    background-color: ${lightColors['surface/hover']};
    color: ${lightColors['text/primary']};
    &:active {
      background: ${lightColors['surface/inset']};
      color: ${lightColors['text/primary']};
    }
  }
  .react-select__option--is-selected {
    background-color: ${lightColors['action/secondaryHover']};
    color: ${lightColors['text/primary']};
    &:active {
      background: ${lightColors['action/secondaryHover']};
      color: ${lightColors['text/primary']};
    }
  }

  .react-select__single-value--is-disabled {
    color: ${lightColors['text/tertiary']};
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
  searchableLength?: number
  noOptionsMessage?: (obj: { inputValue: string }) => string | null
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
      // Prevents premature Formik validation on mobile where react-select blurs the input synchronously before onChange settles
      blurInputOnSelect={false}
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
