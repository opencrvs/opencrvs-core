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
import { Pagination, SortAndFilter } from '..'
import { Omit } from '../../omit'
import styled from 'styled-components'

import {
  ISelectGroupProps,
  ISelectGroupValue,
  ISelectGroupOption,
  SelectFieldType
} from '../SelectGroup'

import { ISortAndFilterItem, IInputLabel } from './SortAndFilter'
import { IDynamicValues } from 'src/components/common-types'

const Wrapper = styled.div`
  width: 100%;
`
const StyledList = styled.ul`
  ${({ theme }) => theme.fonts.reg16};
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
`
const ResultsText = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  ${({ theme }) => theme.fonts.bold16};
  margin: 10px 0;
`

type CustomSelectGroupProp = Omit<ISelectGroupProps, 'onChange' | 'values'>

export interface ISortAndFilter {
  selects: CustomSelectGroupProp
  input: IInputLabel
}

export interface ISearchResultProps {
  data: IDynamicValues[]
  sortBy?: ISortAndFilter
  filterBy?: ISortAndFilter
  resultLabel: string
  noResultText: string
  zeroPagination?: boolean
  cellRenderer: (cellData: IDynamicValues, key: number) => JSX.Element
  onSortChange?: (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue,
    type?: SelectFieldType
  ) => void
  onFilterChange?: (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue,
    type?: SelectFieldType
  ) => void
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalPages?: number
  initialPage?: number
}

interface ICustomState {
  currentPage: number
  sortBySelectedValues: IDynamicValues
  filterBySelectedValues: IDynamicValues
}

const defaultConfiguration = {
  pageSize: 10,
  initialPage: 1
}

const sortByDateDesc = (key: string, value: string, data: IDynamicValues[]) => {
  return [...data].sort((a, b) => {
    return new Date(b[key]).valueOf() - new Date(a[key]).valueOf()
  })
}

const sortByDateAsc = (key: string, value: string, data: IDynamicValues[]) => {
  return [...data].sort((a, b) => {
    return new Date(a[key]).valueOf() - new Date(b[key]).valueOf()
  })
}

const sortByDate = (key: string, value: string, data: IDynamicValues[]) => {
  if (value === 'asc') {
    return sortByDateAsc(key, value, data)
  } else if (value === 'desc') {
    return sortByDateDesc(key, value, data)
  } else {
    return []
  }
}

const defaultSort = (key: string, value: string, data: IDynamicValues[]) => {
  return [...data].sort((a, b) => {
    if (a[key] < b[key]) {
      return -1
    }
    if (a[key] > b[key]) {
      return 1
    }
    return 0
  })
}

const getSortAndFilterByPropsWithValues = (
  prop: ISortAndFilter,
  values: IDynamicValues
): ISortAndFilterItem => {
  const selects = {
    name: prop.selects.name,
    values,
    options: prop.selects.options
  }
  const propWithValues: ISortAndFilterItem = {
    input: prop.input,
    selects
  }
  return propWithValues
}

const getTotalPageNumber = (totalItemCount: number, pageSize: number) => {
  return totalItemCount > 0 ? Math.ceil(totalItemCount / pageSize) : 0
}

const filterItems = (key: string, value: string, items: IDynamicValues[]) => {
  return items.filter((item) => item[key].toLowerCase() === value.toLowerCase())
}

export class DataTable extends React.Component<
  ISearchResultProps,
  ICustomState
> {
  state = {
    currentPage: this.props.initialPage || defaultConfiguration.initialPage,
    sortBySelectedValues: {},
    filterBySelectedValues: {}
  }

  sortData = (
    data: IDynamicValues[],
    sortBy: ISortAndFilterItem
  ): IDynamicValues[] => {
    let sortedData: IDynamicValues[] = data
    sortBy.selects.options.map((option: ISelectGroupOption) => {
      const val = sortBy.selects.values[option.name]
      sortedData = val
        ? option.type === SelectFieldType.Date
          ? sortByDate(option.name, val, data)
          : defaultSort(option.name, val, data)
        : sortedData
    })

    return sortedData
  }

  filterData = (
    data: IDynamicValues[],
    filterBy: ISortAndFilterItem
  ): IDynamicValues[] => {
    let filteredData: IDynamicValues[] = data
    filterBy.selects.options.map((option: ISelectGroupOption) => {
      const val = filterBy.selects.values[option.name]
      filteredData = val
        ? filterItems(option.name, val, filteredData)
        : filteredData
    })
    return filteredData
  }

  onFilterChange = (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue,
    type?: SelectFieldType
  ) => {
    if (this.props.onFilterChange) {
      this.props.onFilterChange(values, changedValue, type)
    } else {
      this.setState({ filterBySelectedValues: values })
    }
  }

  onSortChange = (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue,
    type?: SelectFieldType
  ) => {
    if (this.props.onSortChange) {
      this.props.onSortChange(values, changedValue, type)
    } else {
      this.setState({ sortBySelectedValues: values })
    }
  }

  getDisplayItems = (
    currentPage: number,
    pageSize: number,
    allItems: IDynamicValues[],
    zeroPagination: boolean | undefined
  ) => {
    if (zeroPagination || allItems.length <= pageSize) {
      // expect that allItem is already sliced correctly externally
      return allItems
    }

    // perform internal pagination
    const offset = (currentPage - 1) * pageSize
    const displayItems = allItems.slice(offset, offset + pageSize)
    return displayItems
  }

  ensureAllValuesInitialized = (
    item: ISortAndFilter,
    values: IDynamicValues
  ): IDynamicValues => {
    item.selects.options.forEach((element: ISelectGroupOption) => {
      values[element.name] = element.value || ''
    })
    return values
  }

  onPageChange = (currentPage: number) => {
    if (this.props.onPageChange) {
      this.props.onPageChange(currentPage)
    } else {
      this.setState({ currentPage })
    }
  }

  render() {
    const {
      resultLabel,
      data,
      sortBy,
      filterBy,
      zeroPagination,
      pageSize = defaultConfiguration.pageSize,
      initialPage = defaultConfiguration.initialPage
    } = this.props
    const { currentPage, sortBySelectedValues, filterBySelectedValues } =
      this.state

    const sortValues =
      sortBy && this.ensureAllValuesInitialized(sortBy, sortBySelectedValues)
    const filterValues =
      filterBy &&
      this.ensureAllValuesInitialized(filterBy, filterBySelectedValues)

    const sortByItemsWithValues =
      sortBy &&
      sortValues &&
      getSortAndFilterByPropsWithValues(sortBy, sortValues)

    const filterByItemsWithValues =
      filterBy &&
      filterValues &&
      getSortAndFilterByPropsWithValues(filterBy, filterValues)

    const totalPages = this.props.totalPages
      ? this.props.totalPages
      : getTotalPageNumber(
          data.length,
          this.props.pageSize || defaultConfiguration.pageSize
        )

    return (
      <Wrapper>
        {!zeroPagination && (
            <SortAndFilter
              sortBy={sortByItemsWithValues}
              filterBy={filterByItemsWithValues}
              onChangeSort={this.onSortChange}
              onChangeFilter={this.onFilterChange}
            />
          ) && (
            <ResultsText>
              {resultLabel}({data.length})
            </ResultsText>
          )}
        <StyledList>
          {this.getDisplayItems(
            currentPage,
            pageSize,
            data,
            zeroPagination
          ).map((item, index) => this.props.cellRenderer(item, index))}
        </StyledList>
        {!zeroPagination && data.length > 0 && (
          <Pagination
            initialPage={initialPage}
            totalPages={totalPages}
            onPageChange={this.onPageChange}
          />
        )}
      </Wrapper>
    )
  }
}
