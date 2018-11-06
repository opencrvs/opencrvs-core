import * as React from 'react'
import { Pagination, ResultList, SortAndFilter } from '../interface'
import { IResult } from '../interface/ResultList'
import { Omit } from '../omit'
import styled from 'styled-components'

import {
  ISelectGroupProps,
  ISelectGroupValue,
  ISelectGroupOption
} from './SelectGroup'

import { IInputFieldProps, ICustomProps } from '../forms'
import { ISortAndFilterItem } from './SortAndFilter'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
`
const ResultsText = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  font-size: 16px;
  font-weight: 500;
  margin: 10px 0;
  line-height: 22px;
`
const StyledPagination = styled(Pagination)`
  margin-top: 20px;
`

interface ISelectValues {
  [index: string]: string
}

interface IDynamicValues {
  [key: string]: string
}

export type CustomResult = IResult & IDynamicValues
type CustomSelectGroupProp = Omit<ISelectGroupProps, 'onChange' | 'values'>

export interface ISortAndFilter {
  selects: CustomSelectGroupProp
  input: IInputFieldProps
}
interface ISearchResultProps {
  data: CustomResult[]
  sortBy: ISortAndFilter
  filterBy: ISortAndFilter
  resultLabel: string
  noResultText: string
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
}

const configuration = {
  pageSize: 10,
  initialPage: 1
}
const sortByDate = (key: string, value: string, data: CustomResult[]) => {
  switch (value) {
    case 'asc':
      return data.sort((a, b) => {
        return +new Date(b[key]) - +new Date(a[key])
      })
      break
    case 'desc':
      return data.sort((a, b) => {
        return +new Date(a[key]) - +new Date(b[key])
      })
      break
    default:
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

const getTotalPageNumber = (totalItemCount: number) => {
  return totalItemCount > 0
    ? Math.ceil(totalItemCount / configuration.pageSize)
    : 0
}

const filterItems = (key: string, value: string, items: CustomResult[]) =>
  items.filter((item: IDynamicValues) => item[key] === value)

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
      sortByItemsWithValues
    } = this.calculateInitialState(this.props)

    this.state = {
      totalPages,
      displayItems,
      pageSize,
      filteredSortedItems,
      filterValues,
      sortValues,
      filterByItemsWithValues,
      sortByItemsWithValues
    }
  }

  componentDidMount() {
    const {
      totalPages,
      displayItems,
      pageSize,
      filteredSortedItems,
      filterValues,
      sortValues,
      filterByItemsWithValues,
      sortByItemsWithValues
    } = this.calculateInitialState(this.props)
    this.setState(() => ({
      totalPages,
      displayItems,
      pageSize,
      filteredSortedItems,
      filterValues,
      sortValues,
      sortByItemsWithValues,
      filterByItemsWithValues
    }))
  }

  calculateInitialState = (props: ISearchResultProps): ICustomState => {
    const { data, sortBy, filterBy } = props

    const initialTotalPage = getTotalPageNumber(data.length)
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
      configuration.initialPage,
      configuration.pageSize,
      data
    )
    return {
      totalPages: initialTotalPage,
      displayItems,
      pageSize: configuration.pageSize,
      filteredSortedItems: data,
      filterValues,
      sortValues,
      sortByItemsWithValues,
      filterByItemsWithValues
    }
  }

  onFilterChange = (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => {
    let filteredItems = this.props.data

    Object.keys(values).forEach((filterKey: string) => {
      if (values[filterKey]) {
        filteredItems = filterItems(filterKey, values[filterKey], filteredItems)
      }
    })
    const filterByItemsWithValues = getSortAndFilterByPropsWithValues(
      this.props.filterBy,
      values
    )

    this.setState(() => {
      return { filterByItemsWithValues }
    })
    this.resetPagination(filteredItems)
  }

  onSortChange = (
    values: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => {
    const key = Object.keys(changedValue)[0]
    const selectedValue = changedValue[key]
    const sortedItems = sortByDate(
      key,
      selectedValue,
      this.state.filteredSortedItems
    )
    const sortByItemsWithValues = getSortAndFilterByPropsWithValues(
      this.props.sortBy,
      values
    )

    this.setState(() => {
      return { sortByItemsWithValues }
    })
    this.resetPagination(sortedItems)
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

  resetPagination = (filteredItems: CustomResult[]) => {
    const totalPages = getTotalPageNumber(filteredItems.length)
    const displayItems = this.getDisplayItems(
      configuration.initialPage,
      configuration.pageSize,
      filteredItems
    )
    this.setState(() => ({
      filteredSortedItems: filteredItems,
      displayItems,
      totalPages
    }))
  }

  render() {
    const {
      displayItems,
      totalPages,
      sortByItemsWithValues,
      filterByItemsWithValues,
      filteredSortedItems
    } = this.state
    const { resultLabel, noResultText } = this.props
    return (
      <Wrapper>
        <div>
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
            <StyledPagination
              pageSize={configuration.pageSize}
              initialPage={configuration.initialPage}
              totalItemCount={filteredSortedItems.length}
              totalPages={totalPages}
              onPageChange={this.onPageChange}
            />
          )}
        </div>
      </Wrapper>
    )
  }
}
