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
import { components, DropdownIndicatorProps, MenuListProps } from 'react-select'
import AsyncSelect from 'react-select/async'
import { List, RowComponentProps } from 'react-window'
import styled from 'styled-components'
import { Icon } from '@opencrvs/components/src/Icon'

const ITEM_HEIGHT = 40

export interface Option<T = string> {
  value: T
  label: string
}

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

interface SearchableSelectProps<T = string> {
  onChange: (value: Option<T> | undefined) => void
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void
  value: Option<T> | undefined
  options: Option<T>[]
  id: string
  error?: boolean
  touched?: boolean
  placeholder?: string
}

function RowComponent<T>({
  selectOption,
  options,
  index,
  style
}: RowComponentProps<{
  options: Option<T>[]
  selectOption: (newValue: Option<T>) => void
}>) {
  return (
    <DropDownItem
      key={index}
      id={`locationOption${index}`}
      style={style}
      onClick={() => selectOption(options[index])}
    >
      {options[index].label}
    </DropDownItem>
  )
}

function MenuList<T>({
  options,
  selectOption,
  innerProps,
  innerRef,
  maxHeight
}: MenuListProps<Option<T>, false>) {
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

function DropdownIndicator(props: DropdownIndicatorProps<Option>) {
  return (
    <components.DropdownIndicator {...props}>
      <Icon color="grey600" name="CaretDown" size="small" />
    </components.DropdownIndicator>
  )
}

const StyledSelect = styled(AsyncSelect)<SearchableSelectProps>`
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

const VISIBLE_OPTIONS_COUNT = 50

export function SearchableSelect({ options, ...props }: SearchableSelectProps) {
  const loadOptions = async (searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    const matches = options.filter((o) => o.label.toLowerCase().includes(term))

    return Promise.resolve(matches.slice(0, VISIBLE_OPTIONS_COUNT))
  }

  return (
    <StyledSelect
      {...props}
      cacheOptions
      isSearchable
      classNamePrefix="react-select"
      components={{
        MenuList,
        DropdownIndicator,
        IndicatorSeparator: () => null
      }}
      defaultOptions={options.slice(0, VISIBLE_OPTIONS_COUNT)}
      loadOptions={loadOptions}
      // NOTE: null is not the same as undefined for AsyncSelect.
      value={props.value ?? null}
    />
  )
}
