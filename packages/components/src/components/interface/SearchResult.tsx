import * as React from 'react'
import { Pagination, ResultList, SortAndFilter } from '../interface'
import { IResult } from '../interface/ResultList'
import { Omit } from '../omit'
import styled from 'styled-components'

import {
  ISelectGroupProps,
  ISelectGroupValue,
  ISelectGroupOption,
  SelectFieldType
} from './SelectGroup'

import { ISortAndFilterItem, IInputLabel } from './SortAndFilter'

const Wrapper = styled.div`
  width: 100%;
`
const ResultsText = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  font-size: 16px;
  font-weight: 500;
  margin: 10px 0;
  line-height: 22px;
`
interface ISelectValues {
  [index: string]: string
}

interface IDynamicValues {
  [key: string]: string
}

interface ISortAndFilterFields {
  sortFilterFields: IDynamicValues
}

export type CustomResult = IResult & ISortAndFilterFields
type CustomSelectGroupProp = Omit<ISelectGroupProps, 'onChange' | 'values'>

export interface ISortAndFilter {
  selects: CustomSelectGroupProp
  input: IInputLabel
}

interface ISearchResultProps {
  data: CustomResult[]
  sortBy: ISortAndFilter
  filterBy: ISortAndFilter
  resultLabel: string
  noResultText: string
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
  filteredSortedItems: CustomResult[]
  displayItems: IResult[]
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

const sortByDateAsc = (key: string, value: string, data: CustomResult[]) => {
  return [...data].sort((a, b) => {
    return (
      new Date(b.sortFilterFields[key]).valueOf() -
      new Date(a.sortFilterFields[key]).valueOf()
    )
  })
}

const sortByDateDesc = (key: string, value: string, data: CustomResult[]) => {
  return [...data].sort((a, b) => {
    return (
      new Date(a.sortFilterFields[key]).valueOf() -
      new Date(b.sortFilterFields[key]).valueOf()
    )
  })
}

const sortByDate = (key: string, value: string, data: CustomResult[]) => {
  if (value === 'asc') {
    return sortByDateAsc(key, value, data)
  } else if (value === 'desc') {
    return sortByDateDesc(key, value, data)
  } else {
    return []
  }
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

const filterItems = (key: string, value: string, items: CustomResult[]) =>
  items.filter((item: CustomResult) => item.sortFilterFields[key] === value)

export class SearchResult extends React.Component<
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
      if (type === SelectFieldType.Date) {
        const key = Object.keys(changedValue)[0]
        const selectedValue = changedValue[key]
        const sortedItems = sortByDate(
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
    allItems: CustomResult[]
  ): IResult[] => {
    const offset = (currentPage - 1) * pageSize
    const displayItems = allItems.slice(offset, offset + pageSize)
    const modifiedDisplayItems: IResult[] = displayItems.map(
      (item: CustomResult) => {
        return { info: item.info, status: item.status }
      }
    )
    return modifiedDisplayItems
  }

  initializeSelectValues = (item: ISortAndFilter): IDynamicValues => {
    const values: ISelectValues = {}

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

  resetPagination = (filteredItems: CustomResult[]) => {
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
        <ResultList list={displayItems} />
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
