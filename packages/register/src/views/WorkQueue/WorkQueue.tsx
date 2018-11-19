import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'styled-components'
import * as moment from 'moment'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'
import {
  Banner,
  SearchInput,
  ISearchInputProps,
  ListItem,
  Spinner
} from '@opencrvs/components/lib/interface'
import { DataTable } from '@opencrvs/components/lib/interface/DataTable'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  GQLBirthRegistration,
  GQLRegWorkflow,
  GQLLocation,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import {
  StatusGray,
  StatusOrange,
  StatusGreen,
  StatusCollected
} from '@opencrvs/components/lib/icons'
import { HomeViewHeader } from 'src/components/HomeViewHeader'

export const FETCH_REGISTRATION_QUERY = gql`
  query list {
    listBirthRegistrations {
      id
      registration {
        trackingId
        # status { # these are disabled until we re actually setting these in the registrations
        #   user { # they will be used by the expanded component
        #     firstName
        #     lastName
        #     role {
        #       type
        #     }
        #   }
        #   location {
        #     name
        #     alias
        #   }
        # }
      }
      child {
        name {
          use
          firstNames
          familyName
        }
        birthDate
      }
      createdAt
    }
  }
`

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
  queryError: {
    id: 'register.workQueue.queryError',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  },
  dataTableResults: {
    id: 'register.workQueue.dataTable.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'register.workQueue.dataTable.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  headerTitle: {
    id: 'register.workQueue.header.title',
    defaultMessage: 'Hello Registrar',
    description: 'The displayed title in the Work Queue header'
  },
  headerDescription: {
    id: 'register.workQueue.header.description',
    defaultMessage: 'Review | Registration | Certification',
    description: 'The displayed description in the Work Queue header'
  },
  filtersSortBy: {
    id: 'register.workQueue.filters.sortBy',
    defaultMessage: 'Sort By',
    description: 'Label for the sort by section of the filters'
  },
  filtersOldestToNewest: {
    id: 'register.workQueue.filters.oldestToNewest',
    defaultMessage: 'Oldest to newest',
    description: 'Label for the sort by oldest to newest option'
  },
  filtersNewestToOldest: {
    id: 'register.workQueue.filters.newestToOldest',
    defaultMessage: 'Newest to oldest',
    description: 'Label for the sort by newest to oldest option'
  },
  filtersFilterBy: {
    id: 'register.workQueue.filters.filterBy',
    defaultMessage: 'Sort By',
    description: 'Label for the sort by section of the filters'
  },
  filtersBirth: {
    id: 'register.workQueue.filters.birth',
    defaultMessage: 'Birth',
    description: 'Label for the filter by birth option'
  },
  filtersDeath: {
    id: 'register.workQueue.filters.death',
    defaultMessage: 'Death',
    description: 'Label for the filter by death option'
  },
  filtersMarriage: {
    id: 'register.workQueue.filters.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for the filter by marriage option'
  },
  filtersApplication: {
    id: 'register.workQueue.filters.application',
    defaultMessage: 'Application',
    description: 'Label for the filter by application option'
  },
  filtersRegistered: {
    id: 'register.workQueue.filters.registered',
    defaultMessage: 'Registered',
    description: 'Label for the filter by registered option'
  },
  filtersCollected: {
    id: 'register.workQueue.filters.collected',
    defaultMessage: 'Collected',
    description: 'Label for the filter by collected option'
  },
  listItemName: {
    id: 'register.workQueue.listItem.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemDob: {
    id: 'register.workQueue.listItem.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  listItemDateOfApplication: {
    id: 'register.workQueue.listItem.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Label for date of application in work queue list item'
  },
  listItemTrackingNumber: {
    id: 'register.workQueue.listItem.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in work queue list item'
  }
})

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

const Container = styled.div`
  z-index: 1;
  position: relative;
  margin-top: -70px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
type IWorkQueueProps = InjectedIntlProps & IViewHeadingProps & ISearchInputProps

class WorkQueueView extends React.Component<IWorkQueueProps> {
  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
      case 'application':
        return <StatusOrange />
      case 'registered':
        return <StatusGreen />
      case 'collected':
        return <StatusCollected />
      default:
        return <StatusOrange />
    }
  }

  transformData = (data: GQLQuery) => {
    if (!data.listBirthRegistrations) {
      return []
    }

    return data.listBirthRegistrations.map((reg: GQLBirthRegistration) => {
      const names = (reg.child && (reg.child.name as GQLHumanName[])) || []
      const namesMap = names.reduce((prevNamesMap, name) => {
        if (!name) {
          return prevNamesMap
        }
        if (!name.use) {
          prevNamesMap['default'] = `${name.firstNames} ${
            name.familyName
          }`.trim()
          return prevNamesMap
        }

        prevNamesMap[name.use] = `${name.firstNames} ${name.familyName}`.trim()
        return prevNamesMap
      }, {})

      return {
        name:
          (namesMap['english'] as string) || // needs to read language in use
          (namesMap['default'] as string) ||
          '',
        dob: (reg.child && reg.child.birthDate) || '',
        date_of_application: moment(reg.createdAt).fromNow(), // ??
        tracking_id: (reg.registration && reg.registration.trackingId) || '',
        createdAt: reg.createdAt as string,
        declaration_status:
          (reg.registration &&
            reg.registration.status &&
            (reg.registration.status[0] as GQLRegWorkflow).type) ||
          'application', // TODO don't default to application - this is here as we don't have any status information at the moment
        event: 'birth',
        location:
          (reg.registration &&
            reg.registration.status &&
            ((reg.registration.status[0] as GQLRegWorkflow)
              .location as GQLLocation).name) ||
          ''
      }
    })
  }

  renderCell = (item: { [key: string]: string }, key: number): JSX.Element => {
    const info = []
    const status = []

    info.push({
      label: this.props.intl.formatMessage(messages.listItemName),
      value: item.name
    })
    info.push({
      label: this.props.intl.formatMessage(messages.listItemDob),
      value: item.dob
    })
    info.push({
      label: this.props.intl.formatMessage(messages.listItemDateOfApplication),
      value: item.date_of_application
    })
    info.push({
      label: this.props.intl.formatMessage(messages.listItemTrackingNumber),
      value: item.tracking_id
    })

    status.push({ icon: <StatusGray />, label: item.event })
    status.push({
      icon: this.getDeclarationStatusIcon(item.declaration_status),
      label: item.declaration_status
    })
    return (
      <ListItem
        index={key}
        infoItems={info}
        statusItems={status}
        key={key}
        itemData={{}}
        expandedCellRenderer={() => <div>Dummy expanded view</div>}
      />
    )
  }

  render() {
    const { intl } = this.props

    const sortBy = {
      input: {
        label: intl.formatMessage(messages.filtersSortBy)
      },
      selects: {
        name: '',
        options: [
          {
            name: 'createdAt',
            options: [
              {
                value: 'asc',
                label: intl.formatMessage(messages.filtersOldestToNewest)
              },
              {
                value: 'desc',
                label: intl.formatMessage(messages.filtersNewestToOldest)
              }
            ],
            value: ''
          }
        ]
      }
    }

    const filterBy = {
      input: {
        label: intl.formatMessage(messages.filtersFilterBy)
      },
      selects: {
        name: '',
        options: [
          {
            name: 'event',
            options: [
              {
                value: 'birth',
                label: intl.formatMessage(messages.filtersBirth)
              },
              {
                value: 'death',
                label: intl.formatMessage(messages.filtersDeath)
              },
              {
                value: 'marriage',
                label: intl.formatMessage(messages.filtersMarriage)
              }
            ],
            value: ''
          },
          {
            name: 'declaration_status',
            options: [
              {
                value: 'application',
                label: intl.formatMessage(messages.filtersApplication)
              },
              {
                value: 'registered',
                label: intl.formatMessage(messages.filtersRegistered)
              },
              {
                value: 'collected',
                label: intl.formatMessage(messages.filtersCollected)
              }
            ],
            value: ''
          },
          {
            name: 'location',
            options: [
              // TODO these need to be translated but those needs to be read from our backend when we have locations setup
              { value: 'gazipur', label: 'Gazipur Union' },
              { value: 'badda', label: 'Badda Union' },
              { value: 'dhamrai', label: 'Dhamrai Union' },
              { value: 'savar', label: 'Savar Union' },
              { value: 'dohar', label: 'Dohar Union' }
            ],
            value: ''
          }
        ]
      }
    }

    return (
      <>
        <HomeViewHeader>
          <ViewHeading
            title={intl.formatMessage(messages.headerTitle)}
            description={intl.formatMessage(messages.headerDescription)}
            {...this.props}
          />
        </HomeViewHeader>
        <Container>
          <Query query={FETCH_REGISTRATION_QUERY}>
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  <StyledSpinner id="work-queue-spinner" baseColor="#F4F4F4" />
                )
              }
              if (error) {
                return (
                  <ErrorText id="work-queue-error-text">
                    {intl.formatMessage(messages.queryError)}
                  </ErrorText>
                )
              }

              const transformedData = this.transformData(data)

              return (
                <>
                  <Banner
                    text={intl.formatMessage(messages.bannerTitle)}
                    count={transformedData.length}
                  />
                  <SearchInput
                    placeholder={intl.formatMessage(
                      messages.searchInputPlaceholder
                    )}
                    buttonLabel={intl.formatMessage(
                      messages.searchInputButtonTitle
                    )}
                    {...this.props}
                  />
                  <DataTable
                    data={transformedData}
                    sortBy={sortBy}
                    filterBy={filterBy}
                    cellRenderer={this.renderCell}
                    resultLabel={intl.formatMessage(messages.dataTableResults)}
                    noResultText={intl.formatMessage(
                      messages.dataTableNoResults
                    )}
                  />
                </>
              )
            }}
          </Query>
        </Container>
      </>
    )
  }
}

export const WorkQueue = connect(null)(injectIntl(WorkQueueView))
