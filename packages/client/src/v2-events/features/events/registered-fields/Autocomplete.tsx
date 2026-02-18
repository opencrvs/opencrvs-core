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
import React, { useMemo } from 'react'
import {
  SingleValue,
  GroupBase,
  OptionsOrGroups,
  components,
  DropdownIndicatorProps,
  MenuListProps
} from 'react-select'
import AsyncSelect, { AsyncProps } from 'react-select/async'
import styled from 'styled-components'
import {
  AutocompleteField,
  AutocompleteValue,
  AutocompleteUpdateValue,
  FieldPropsWithoutReferenceValue,
  FieldType
} from '@opencrvs/commons/client'
import { List, RowComponentProps } from 'react-window'
import { Icon } from '@opencrvs/components'
import { Option } from '../../../utils'

const ITEM_HEIGHT = 40

const DropDownItem = styled.li`
  height: 40px;
  border-radius: 4px;
  margin-bottom: 2px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 8px 16px;
  white-space: nowrap;
  cursor: pointer;
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ theme }) => theme.colors.copy};

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
`

function RowComponent<T extends string | number>({
  selectOption,
  options,
  index,
  style
}: RowComponentProps<{
  options: OptionsOrGroups<Option<T>, GroupBase<Option<T>>>
  selectOption: (newValue: Option<T>) => void
}>) {
  const option = options[index]

  if (!('value' in option)) {
    // Groups are not selectable rows
    return <div style={style} />
  }

  return (
    <DropDownItem
      key={index}
      id={`locationOption${index}`}
      style={style}
      onClick={option.value ? () => selectOption(option) : undefined}
    >
      {option.value}: {option.label}
    </DropDownItem>
  )
}

function MenuList<T extends string | number>({
  options,
  selectOption,
  innerProps,
  innerRef,
  maxHeight
}: MenuListProps<Option<T>, false, GroupBase<Option<T>>>) {
  return (
    // This div becomes the scroll container
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        maxHeight, // react-select passes max height
        overflowY: 'auto',
        width: '100%',
        padding: 0
      }}
    >
      <List
        rowComponent={RowComponent}
        rowCount={options.length}
        rowHeight={ITEM_HEIGHT}
        rowProps={{ options, selectOption }}
      />
    </div>
  )
}

export function DropdownIndicator<T>(
  props: DropdownIndicatorProps<Option<T>, false, GroupBase<Option<T>>>
) {
  return (
    <components.DropdownIndicator {...props}>
      <Icon color="grey600" name="CaretDown" size="small" />
    </components.DropdownIndicator>
  )
}

interface StyledProps {
  error?: boolean
  touched?: boolean
}

/**
 * Internal implementation of AsyncSelect to allow styled-components theming.
 * @returns Passthrough AsyncSelect component to be used with styled-components.
 */
function BaseAsyncSelect(
  props: AsyncProps<AutocompleteValue, false, GroupBase<AutocompleteValue>> &
    StyledProps
) {
  return <AsyncSelect {...props} />
}

export const StyledAsyncSelect = styled(BaseAsyncSelect)<StyledProps>`
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
      ${({ error, touched, isDisabled, theme }) =>
        /* eslint-disable no-nested-ternary */
        error && touched
          ? theme.colors.negative
          : isDisabled
            ? theme.colors.grey300
            : theme.colors.copy};
    &:hover {
      border: 1.5px solid
        ${({ error, touched, isDisabled, theme }) =>
          error && touched
            ? theme.colors.negative
            : isDisabled
              ? theme.colors.grey300
              : theme.colors.copy};
      outline: 0.5px solid
        ${({ error, touched, isDisabled, theme }) =>
          error && touched
            ? theme.colors.negative
            : isDisabled
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

type AutocompleteProps = FieldPropsWithoutReferenceValue<
  typeof FieldType.AUTOCOMPLETE
> & {
  id: string
  onChange: (newValue: SingleValue<AutocompleteValue>) => void
  configuration?: AutocompleteField['configuration']
  value?: AutocompleteValue | null
  error?: boolean
  touched?: boolean
}

function debouncePromise<Args extends any[], R>(
  fn: (...args: Args) => Promise<R>,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout>

  return async (...args: Args): Promise<R> =>
    new Promise((resolve) => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        resolve(await fn(...args))
      }, delay)
    })
}

function AutocompleteInput(props: AutocompleteProps) {
  const { id, onChange, value, configuration, error, touched } = props

  const fetchOptions = async (
    inputValue: string
  ): Promise<AutocompleteValue[]> => {
    if (!inputValue) {
      return []
    }

    const res = await fetch(
      `${configuration.url}${encodeURIComponent(inputValue)}`
    )

    if (!res.ok) {
      return []
    }

    const [, displays] = await res.json()

    return displays.map(([code, label]: [string, string]) => ({
      value: code,
      label
    }))
  }

  const debouncedFetchOptions = useMemo(
    () => debouncePromise(fetchOptions, 400),

    []
  )

  const loadOptions = async (inputValue: string) => {
    return debouncedFetchOptions(inputValue)
  }

  const handleChange = (newValue: SingleValue<AutocompleteValue>) => {
    onChange(newValue)
  }

  console.log('value :>> ', value)

  return (
    <StyledAsyncSelect
      cacheOptions
      isSearchable
      classNamePrefix="react-select"
      components={{
        MenuList,
        DropdownIndicator,
        IndicatorSeparator: () => null
      }}
      defaultOptions={false}
      error={error}
      formatOptionLabel={(option) => `${option.value}: ${option.label}`}
      id={`autocomplete`}
      inputId={id}
      isClearable={true}
      loadOptions={loadOptions}
      touched={touched}
      value={value}
      onChange={handleChange}
    />
  )
}

export const Autocomplete = {
  Input: AutocompleteInput,
  Output: ({ value }: { value: AutocompleteUpdateValue }) => {
    return value ? `${value?.value}: ${value?.label}` : null
  }
}
