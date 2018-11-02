import * as React from 'react'
import { Pagination, ResultList } from '../interface'
import { IResult } from '../interface/ResultList'
import { InputField } from '../forms/InputField/InputField'

interface ISearchResultProps {
  data: IResult[]
  filterOptions: []
  sortOptions: []
}

interface ICustomState {
  filterValues: []
  sortedValues: []
  filteredSortedItems: IResult[]
  displayItems: IResult[]
  pageSize: number
  totalPages: number
}

const configuration = {
  pageSize: 10,
  initialPage: 1
}
export class SearchResult extends React.Component<
  ISearchResultProps,
  ICustomState
> {
  constructor(props: ISearchResultProps, {}) {
    super(props)
    const initialTotalPage = Math.ceil(
      props.data.length / configuration.pageSize
    )
    this.state = {
      totalPages: initialTotalPage,
      displayItems: this.getDisplayItems(
        configuration.initialPage,
        configuration.pageSize,
        props.data
      ),
      pageSize: configuration.pageSize,
      filteredSortedItems: props.data,
      filterValues: [],
      sortedValues: []
    }
  }
  onFilterChange = (value: string) => {
    alert('value')
  }

  onSortChange = (value: string) => {
    alert('value')
  }

  getDisplayItems = (
    currentPage: number,
    pageSize: number,
    allItems: IResult[]
  ): IResult[] => {
    const offset = (currentPage - 1) * pageSize
    const displayItems = allItems.slice(offset, offset + pageSize)

    return displayItems
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

  render() {
    const { displayItems, totalPages } = this.state
    return (
      <>
        <ResultList list={displayItems} />
        <Pagination
          pageSize={configuration.pageSize}
          initialPage={configuration.initialPage}
          totalItemCount={displayItems.length}
          totalPages={totalPages}
          onPageChange={this.onPageChange}
        />
      </>
    )
  }
}
