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
    listBirthRegistrations(status: "declared") {
      id
      registration {
        trackingId
        # status {
        #   user {
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

const sortBy = {
  input: {
    label: 'Sort By'
  },
  selects: {
    name: '',
    options: [
      {
        name: 'createdAt',
        options: [
          { value: 'asc', label: 'Oldest to newest' },
          { value: 'desc', label: 'Newest to oldest' }
        ],
        value: ''
      }
    ]
  }
}

const filterBy = {
  input: {
    label: 'Filter By'
  },
  selects: {
    name: '',
    options: [
      {
        name: 'event',
        options: [
          { value: 'birth', label: 'Birth' },
          { value: 'death', label: 'Death' },
          { value: 'marriage', label: 'Marriage' }
        ],
        value: ''
      },
      {
        name: 'declaration_status',
        options: [
          { value: 'application', label: 'Application' },
          { value: 'collected', label: 'Collected' },
          { value: 'registered', label: 'Registered' }
        ],
        value: ''
      },
      {
        name: 'location',
        options: [
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
          'application', // TODO
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

    info.push({ label: 'Name', value: item.name })
    info.push({ label: 'D.o.B', value: item.dob })
    info.push({ label: 'Date of application', value: item.date_of_application })
    info.push({ label: 'Tracking ID', value: item.tracking_id })

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
                    resultLabel="Results"
                    noResultText="No result to display"
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
