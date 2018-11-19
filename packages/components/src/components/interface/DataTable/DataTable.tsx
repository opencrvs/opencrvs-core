import * as React from 'react'
import { Pagination, SortAndFilter } from '..'
import { Omit } from '../../omit'
import styled from 'styled-components'
import { isEqual } from 'lodash'

import {
  ISelectGroupProps,
  ISelectGroupValue,
  ISelectGroupOption,
  SelectFieldType
} from '../SelectGroup'

import { ISortAndFilterItem, IInputLabel } from './SortAndFilter'

const Wrapper = styled.div`
  width: 100%;
`
const StyledList = styled.ul`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
`
const ResultsText = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  font-weight: 500;
  margin: 10px 0;
  line-height: 22px;
`

export interface IDynamicValues {
  [key: string]: string
}

type CustomSelectGroupProp = Omit<ISelectGroupProps, 'onChange' | 'values'>

export interface ISortAndFilter {
  selects: CustomSelectGroupProp
  input: IInputLabel
}

export interface ISearchResultProps {
  data: IDynamicValues[]
  sortBy: ISortAndFilter
  filterBy: ISortAndFilter
  resultLabel: string
  noResultText: string
  cellRenderer: (cellData: IDynamicValues, key: number) => React.Component<{}>
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
}

interface ICustomState {
  filterValues: IDynamicValues
  sortValues: IDynamicValues
  filteredSortedItems: IDynamicValues[]
  displayItems: IDynamicValues[]
  pageSize: number
  totalPages: number
  sortByItemsWithValues: ISortAndFilterItem
  filterByItemsWithValues: ISortAndFilterItem
  initialPage: number
}

const defaultConfiguration = {
  pageSize: 10,
  initialPage: 1
}

const sortByDateAsc = (key: string, value: string, data: IDynamicValues[]) => {
  return [...data].sort((a, b) => {
    return new Date(b[key]).valueOf() - new Date(a[key]).valueOf()
  })
}

const sortByDateDesc = (key: string, value: string, data: IDynamicValues[]) => {
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

const defaulSort = (key: string, value: string, data: IDynamicValues[]) => {
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

const filterItems = (key: string, value: string, items: IDynamicValues[]) =>
  items.filter(item => item[key] === value)

export class DataTable extends React.Component<
  ISearchResultProps,
  ICustomState
> {
  constructor(props: ISearchResultProps, {}) {
    super(props)
    const {
      totalPages,
      displayItems,
      pageSize,
      filteredSortedItems,
      filterValues,
      sortValues,
      filterByItemsWithValues,
      sortByItemsWithValues,
      initialPage
    } = this.calculateInitialState(this.props)

    this.state = {
      totalPages,
      displayItems,
      pageSize,
      filteredSortedItems,
      filterValues,
      sortValues,
      filterByItemsWithValues,
      sortByItemsWithValues,
      initialPage
    }
  }

  componentDidUpdate(prevProps: ISearchResultProps) {
    if (!isEqual(prevProps, this.props)) {
      const {
        totalPages,
        displayItems,
        pageSize,
        filteredSortedItems,
        filterValues,
        sortValues,
        filterByItemsWithValues,
        sortByItemsWithValues,
        initialPage
      } = this.calculateInitialState(this.props)

      this.setState(() => ({
        totalPages,
        displayItems,
        pageSize,
        filteredSortedItems,
        filterValues,
        sortValues,
        filterByItemsWithValues,
        sortByItemsWithValues,
        initialPage
      }))
    }
  }

  calculateInitialState = (props: ISearchResultProps): ICustomState => {
    const { data, sortBy, filterBy, pageSize } = props
    const paginationSize = pageSize ? pageSize : defaultConfiguration.pageSize
    const initialTotalPage = getTotalPageNumber(data.length, paginationSize)
    const sortValues = this.initializeSelectValues(sortBy)
    const filterValues = this.initializeSelectValues(filterBy)
    const sortByItemsWithValues = getSortAndFilterByPropsWithValues(
      sortBy,
      sortValues
    )
    const filterByItemsWithValues = getSortAndFilterByPropsWithValues(
      filterBy,
      filterValues
    )
    const displayItems = this.getDisplayItems(
      defaultConfiguration.initialPage,
      paginationSize,
      data
    )
    return {
      totalPages: initialTotalPage,
      displayItems,
      pageSize: paginationSize,
      filteredSortedItems: data,
      filterValues,
      sortValues,
      sortByItemsWithValues,
      filterByItemsWithValues,
      initialPage: 1
    }
  }

  onFilterChange = (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue,
    type?: SelectFieldType
  ) => {
    const filterByItemsWithValues = getSortAndFilterByPropsWithValues(
      this.props.filterBy,
      values
    )

    this.setState(() => {
      return { filterByItemsWithValues }
    })

    if (this.props.onFilterChange) {
      this.props.onFilterChange(values, changedValue, type)
    } else {
      let filteredItems = this.props.data

      Object.keys(values).forEach((filterKey: string) => {
        if (values[filterKey]) {
          filteredItems = filterItems(
            filterKey,
            values[filterKey],
            filteredItems
          )
        }
      })

      this.resetPagination(filteredItems)
    }
  }

  onSortChange = (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue,
    type?: SelectFieldType
  ) => {
    const sortByItemsWithValues = getSortAndFilterByPropsWithValues(
      this.props.sortBy,
      values
    )

    this.setState(() => {
      return { sortByItemsWithValues }
    })

    if (this.props.onSortChange) {
      this.props.onSortChange(values, changedValue, type)
    } else {
      const key = Object.keys(changedValue)[0]
      const selectedValue = changedValue[key]
      if (type === SelectFieldType.Date) {
        const sortedItems = sortByDate(
          key,
          selectedValue,
          this.state.filteredSortedItems
        )
        this.resetPagination(sortedItems)
      } else {
        const sortedItems = defaulSort(
          key,
          selectedValue,
          this.state.filteredSortedItems
        )
        this.resetPagination(sortedItems)
      }
    }
  }

  getDisplayItems = (
    currentPage: number,
    pageSize: number,
    allItems: IDynamicValues[]
  ) => {
    const offset = (currentPage - 1) * pageSize
    const displayItems = allItems.slice(offset, offset + pageSize)
    return displayItems
  }

  initializeSelectValues = (item: ISortAndFilter): IDynamicValues => {
    const values: IDynamicValues = {}

    item.selects.options.forEach((element: ISelectGroupOption) => {
      values[element.name] = ''
    })
    return values
  }

  onPageChange = (currentPage: number) => {
    if (this.props.onPageChange) {
      this.props.onPageChange(currentPage)
    } else {
      const { pageSize, filteredSortedItems, totalPages } = this.state
      const displayItems = this.getDisplayItems(
        currentPage,
        pageSize,
        filteredSortedItems
      )
      this.setState(() => {
        return { displayItems }
      })
    }
  }

  resetPagination = (filteredItems: IDynamicValues[]) => {
    const { pageSize } = this.props
    const paginationSize = pageSize ? pageSize : defaultConfiguration.pageSize
    const totalPages = getTotalPageNumber(filteredItems.length, paginationSize)
    const displayItems = this.getDisplayItems(
      defaultConfiguration.initialPage,
      paginationSize,
      filteredItems
    )
    this.setState(() => ({
      filteredSortedItems: filteredItems,
      displayItems,
      totalPages,
      initialPage: defaultConfiguration.initialPage
    }))
  }

  render() {
    const {
      displayItems,
      totalPages,
      sortByItemsWithValues,
      filterByItemsWithValues,
      filteredSortedItems,
      pageSize,
      initialPage
    } = this.state
    const { resultLabel, noResultText } = this.props

    return (
      <Wrapper>
        <SortAndFilter
          sortBy={sortByItemsWithValues}
          filterBy={filterByItemsWithValues}
          onChangeSort={this.onSortChange}
          onChangeFilter={this.onFilterChange}
        />
        <ResultsText>
          {resultLabel}({filteredSortedItems.length})
        </ResultsText>
        <StyledList>
          {displayItems.map((item, index) =>
            this.props.cellRenderer(item, index)
          )}
        </StyledList>
        {filteredSortedItems.length > 0 && (
          <Pagination
            pageSize={pageSize}
            initialPage={initialPage}
            totalItemCount={filteredSortedItems.length}
            totalPages={totalPages}
            onPageChange={this.onPageChange}
          />
        )}
      </Wrapper>
    )
  }
}
