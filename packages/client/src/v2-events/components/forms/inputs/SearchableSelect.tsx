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
import {
  components,
  DropdownIndicatorProps,
  GroupBase,
  MenuListProps,
  OptionsOrGroups,
  SingleValue
} from 'react-select'
import AsyncSelect, { AsyncProps } from 'react-select/async'
import { List, RowComponentProps } from 'react-window'
import styled from 'styled-components'
import { Icon } from '@opencrvs/components/src/Icon'
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

function RowComponent<T>({
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
      {option.label}
    </DropDownItem>
  )
}

function MenuList<T>({
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

function DropdownIndicator<T>(
  props: DropdownIndicatorProps<Option<T>, false, GroupBase<Option<T>>>
) {
  return (
    <components.DropdownIndicator {...props}>
      <Icon color="grey600" name="CaretDown" size="small" />
    </components.DropdownIndicator>
  )
}

/** Props used for conditional styling with styled-components */
interface StyledProps {
  error?: boolean
  touched?: boolean
}

/**
 * Internal implementation of AsyncSelect to allow styled-components theming.
 * @returns Passthrough AsyncSelect component to be used with styled-components.
 */
function BaseAsyncSelect<T>(
  props: AsyncProps<Option<T>, false, GroupBase<Option<T>>> & StyledProps
) {
  return <AsyncSelect {...props} />
}

/** Based on components/src/Select.tsx */
const StyledAsyncSelect = styled(BaseAsyncSelect)<StyledProps>`
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

const VISIBLE_OPTIONS_COUNT = 50

export interface SearchableSelectProps<T = string> extends StyledProps {
  id: string
  ['data-testid']?: string
  options: Option<T>[]
  value: Option<T> | null
  disabled?: boolean
  onChange: (val: SingleValue<Option<T>>) => void
}

/**
 *
 * A searchable select component using react-select and react-window for virtualization.
 * Used for supporting larger option sets without performance issues. During 1.9.1. we'll only replace the administrative area selects with the component.
 *
 */
export function SearchableSelect<T = string>({
  options,
  onChange,
  value,
  id,
  error,
  touched,
  disabled,
  ['data-testid']: dataTestId
}: SearchableSelectProps<T>) {
  // React-select provides their own filteringOptions method, but it doesn't work with large option sets and virtualization.
  const loadOptions = async (searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    const matches = options.filter((o) => o.label.toLowerCase().includes(term))

    return Promise.resolve(matches.slice(0, VISIBLE_OPTIONS_COUNT))
  }

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
      data-testid={dataTestId}
      defaultOptions={options.slice(0, VISIBLE_OPTIONS_COUNT)}
      error={error}
      innerProps={{ 'data-testid': dataTestId }}
      inputId={id}
      isDisabled={disabled}
      loadOptions={loadOptions}
      touched={touched}
      value={value}
      // @ts-expect-error -- using styled components prevents inferring generic.
      onChange={onChange}
    />
  )
}
