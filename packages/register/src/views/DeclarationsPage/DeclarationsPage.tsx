import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'styled-components'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'

const messages = defineMessages({
  searchInputPlaceholder: {
    id: 'register.declarations.searchInput.placeholder',
    defaultMessage: 'Look for a record',
    description: 'The placeholder of search input'
  },
  searchInputButtonTitle: {
    id: 'register.declarations.buttons.search',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  bannerTitle: {
    id: 'register.declarations.applications.banner',
    defaultMessage: 'Applications to register in your area',
    description: 'The title of the banner'
  },
  allEventsLabel: {
    id: 'register.declarations.labels.events.all',
    defaultMessage: 'All life events',
    description: 'Label for filter option all events'
  },
  birthEventLabel: {
    id: 'register.declarations.labels.events.birth',
    defaultMessage: 'Birth',
    description: 'Label for birth event'
  },
  deathEventLabel: {
    id: 'register.declarations.labels.events.death',
    defaultMessage: 'Death',
    description: 'Label for death event'
  },
  marriageEventLabel: {
    id: 'register.declarations.labels.events.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for marriage event'
  },
  sortLabel: {
    id: 'register.declarations.labels.selects.sort',
    defaultMessage: 'Sort by:',
    description: 'Label for sort select'
  },
  filterLabel: {
    id: 'register.declarations.labels.selects.filter',
    defaultMessage: 'Filter by:',
    description: 'Label for filter select'
  },
  name: {
    id: 'register.declarations.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name'
  },
  dob: {
    id: 'register.declarations.labels.results.dob',
    defaultMessage: 'D.o.B.',
    description: 'Label for date of birth'
  },
  dod: {
    id: 'register.declarations.labels.results.dod',
    defaultMessage: 'D.o.D.',
    description: 'Label for date of death'
  },
  dateOfApplication: {
    id: 'register.declarations.labels.results.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Label for date of application'
  },
  trackingID: {
    id: 'register.declarations.labels.results.trackingID',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID'
  },
  statusAll: {
    id: 'register.declarations.labels.statuses.all',
    defaultMessage: 'All statues',
    description: 'Label for all statuses select option'
  },
  statusApplication: {
    id: 'register.declarations.labels.statuses.application',
    defaultMessage: 'Application',
    description: 'Label for application status'
  },
  statusRegistered: {
    id: 'register.declarations.labels.statuses.registered',
    defaultMessage: 'Registered',
    description: 'Label for registered status'
  },
  statusCollected: {
    id: 'register.declarations.labels.statuses.collected',
    defaultMessage: 'Collected',
    description: 'Label for collected status'
  },
  sortOldestToNewest: {
    id: 'register.declarations.selects.sort.item0',
    defaultMessage: 'Oldest to newest',
    description: 'Label for newest first sort select option'
  },
  sortNewestToOldest: {
    id: 'register.declarations.selects.sort.item1',
    defaultMessage: 'Newst to oldest',
    description: 'Label for oldest first sort select option'
  }
})

const Container = styled.div`
  z-index: 1;
  position: relative;
  margin-top: -30px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
class Declarations extends React.Component<
  InjectedIntlProps & IViewHeadingProps
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
        <Container>{/* Children are later to be populated*/}</Container>
      </>
    )
  }
}

export const DeclarationsPage = connect(null, null)(injectIntl(Declarations))
