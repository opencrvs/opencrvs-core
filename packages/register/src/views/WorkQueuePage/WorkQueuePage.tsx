import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'styled-components'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'
import {
  Banner,
  SearchInput,
  ISearchInputProps
} from '@opencrvs/components/lib/interface'

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
  allEventsLabel: {
    id: 'register.workQueue.labels.events.all',
    defaultMessage: 'All life events',
    description: 'Label for filter option all events'
  },
  birthEventLabel: {
    id: 'register.workQueue.labels.events.birth',
    defaultMessage: 'Birth',
    description: 'Label for birth event'
  },
  deathEventLabel: {
    id: 'register.workQueue.labels.events.death',
    defaultMessage: 'Death',
    description: 'Label for death event'
  },
  marriageEventLabel: {
    id: 'register.workQueue.labels.events.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for marriage event'
  },
  sortLabel: {
    id: 'register.workQueue.labels.selects.sort',
    defaultMessage: 'Sort by:',
    description: 'Label for sort select'
  },
  filterLabel: {
    id: 'register.workQueue.labels.selects.filter',
    defaultMessage: 'Filter by:',
    description: 'Label for filter select'
  },
  name: {
    id: 'register.workQueue.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name'
  },
  dob: {
    id: 'register.workQueue.labels.results.dob',
    defaultMessage: 'D.o.B.',
    description: 'Label for date of birth'
  },
  dod: {
    id: 'register.workQueue.labels.results.dod',
    defaultMessage: 'D.o.D.',
    description: 'Label for date of death'
  },
  dateOfApplication: {
    id: 'register.workQueue.labels.results.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Label for date of application'
  },
  trackingID: {
    id: 'register.workQueue.labels.results.trackingID',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID'
  },
  statusAll: {
    id: 'register.workQueue.labels.statuses.all',
    defaultMessage: 'All statues',
    description: 'Label for all statuses select option'
  },
  statusApplication: {
    id: 'register.workQueue.labels.statuses.application',
    defaultMessage: 'Application',
    description: 'Label for application status'
  },
  statusRegistered: {
    id: 'register.workQueue.labels.statuses.registered',
    defaultMessage: 'Registered',
    description: 'Label for registered status'
  },
  statusCollected: {
    id: 'register.workQueue.labels.statuses.collected',
    defaultMessage: 'Collected',
    description: 'Label for collected status'
  },
  sortOldestToNewest: {
    id: 'register.workQueue.selects.sort.item0',
    defaultMessage: 'Oldest to newest',
    description: 'Label for newest first sort select option'
  },
  sortNewestToOldest: {
    id: 'register.workQueue.selects.sort.item1',
    defaultMessage: 'Newst to oldest',
    description: 'Label for oldest first sort select option'
  }
})

const Container = styled.div`
  z-index: 1;
  position: relative;
  margin-top: -70px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
class WorkQueue extends React.Component<
  InjectedIntlProps & IViewHeadingProps & ISearchInputProps
> {
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
          <Banner text={intl.formatMessage(messages.bannerTitle)} count={15} />
          <SearchInput
            placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
            buttonLabel={intl.formatMessage(messages.searchInputButtonTitle)}
            {...this.props}
          />
        </Container>
      </>
    )
  }
}

export const WorkQueuePage = connect(null)(injectIntl(WorkQueue))
