import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'styled-components'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'
import {
  Banner,
  SearchInput,
  ISearchInputProps,
  ISearchResultProps,
  SearchResult
} from '@opencrvs/components/lib/interface'
import { list, sortBy, filterBy } from './MockListData'

const messages = defineMessages({
  searchInputPlaceholder: {
    id: 'register.workQueue.searchInput.placeholder',
    defaultMessage: 'Look for a record',
    description: 'The placeholder of search input'
  },
  searchInputButtonTitle: {
    id: 'register.workQueue.buttons.search',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  bannerTitle: {
    id: 'register.workQueue.applications.banner',
    defaultMessage: 'Applications to register in your area',
    description: 'The title of the banner'
  },
  resultsTitle: {
    id: 'register.workQueue.labels.results.title',
    defaultMessage: 'Results',
    description: 'The title of results list component'
  },
  resultsEmptyText: {
    id: 'register.workQueue.labels.results.emptyText',
    defaultMessage: 'No results',
    description: 'The text appears when result list is empty'
  }
})

const Container = styled.div`
  z-index: 1;
  position: relative;
  margin-top: -70px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
type IWorkQueueProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  ISearchResultProps

class WorkQueue extends React.Component<IWorkQueueProps> {
  render() {
    const { intl } = this.props
    return (
      <>
        <HomeViewHeader>
          <ViewHeading
            title="Hello Registrar"
            description="Review | Registration | Certification"
            {...this.props}
          />
        </HomeViewHeader>
        <Container>
          <Banner
            text={intl.formatMessage(messages.bannerTitle)}
            count={list.length}
          />
          <SearchInput
            placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
            buttonLabel={intl.formatMessage(messages.searchInputButtonTitle)}
            {...this.props}
          />
          <SearchResult
            data={list}
            sortBy={sortBy}
            filterBy={filterBy}
            resultLabel={intl.formatMessage(messages.resultsTitle)}
            noResultText={intl.formatMessage(messages.resultsEmptyText)}
          />
        </Container>
      </>
    )
  }
}

export const WorkQueuePage = connect(null)(injectIntl(WorkQueue))
