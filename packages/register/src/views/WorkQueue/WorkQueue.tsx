import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'styled-components'
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
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema.d'
import {
  StatusGray,
  StatusOrange,
  StatusGreen,
  StatusCollected
} from '@opencrvs/components/lib/icons'
import { HomeViewHeader } from 'src/components/HomeViewHeader'

const FETCH_REGISTRATION_QUERY = gql`
  query list {
    listBirthRegistrations(status: "declared") {
      id
      registration {
        trackingId
        status {
          user {
            firstName
            lastName
            role {
              type
            }
          }
          location {
            name
            alias
          }
        }
      }
      child {
        name {
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
  }
})

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
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
  transformData = (data: GQLBirthRegistration[]) => {
    console.log(data)
    return data.map((reg: GQLBirthRegistration) => {
      if (
        !reg.child ||
        !reg.child.name ||
        !reg.registration ||
        !reg.registration.status ||
        reg.registration.status[0] !== null ||
        !(reg.registration.status[0] as GQLRegWorkflow).location
      ) {
        throw new Error('Invalid registration')
      }

      const names = reg.child.name as GQLHumanName[]
      const namesMap = names.reduce((prevNamesMap, name) => {
        if (!name || !name.use) {
          return prevNamesMap
        }
        prevNamesMap[name.use] = `${name.firstNames} ${name.familyName}`.trim()
        return prevNamesMap
      }, {})

      return {
        name: namesMap['english'] as string,
        dob: reg.child.birthDate as string,
        date_of_application: reg.createdAt as string, // ??
        tracking_id: reg.registration.trackingId as string,
        createdAt: reg.createdAt as string,
        declaration_status: (reg.registration.status[0] as GQLRegWorkflow)
          .type as string,
        event: 'birth',
        location: ((reg.registration.status[0] as GQLRegWorkflow)
          .location as GQLLocation).name as string
      }
    })
  }

  renderCell(item: { [key: string]: string }, key: number): JSX.Element {
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
                throw new Error(`Error! ${error.message}`)
              }

              return (
                <>
                  <Banner
                    text={intl.formatMessage(messages.bannerTitle)}
                    count={15}
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
                    data={this.transformData(data)}
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

  private getDeclarationStatusIcon = (status: string) => {
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
}

export const WorkQueue = connect(null)(injectIntl(WorkQueueView))
