import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import * as moment from 'moment'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'
import {
  IconAction,
  ActionTitle,
  PrimaryButton
} from '@opencrvs/components/lib/buttons'
import { Plus } from '@opencrvs/components/lib/icons'
import {
  Banner,
  SearchInput,
  ISearchInputProps,
  ListItem,
  Spinner,
  ListItemExpansion,
  SelectFieldType
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
import { IStoreState } from 'src/store'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from 'src/utils/authUtils'
import { ITheme } from '@opencrvs/components/lib/theme'
import { goToEvents as goToEventsAction } from 'src/navigation'
import { IUserDetails, IIdentifier, ILocation } from 'src/utils/userUtils'

export const FETCH_REGISTRATION_QUERY = gql`
  query list($locationIds: [String]) {
    listBirthRegistrations(locationIds: $locationIds) {
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
    id: 'register.workQueue.labels.selects.sort',
    defaultMessage: 'Sort By',
    description: 'Label for the sort by section of the filters'
  },
  filtersOldestToNewest: {
    id: 'register.workQueue.selects.sort.item0',
    defaultMessage: 'Oldest to newest',
    description: 'Label for the sort by oldest to newest option'
  },
  filtersNewestToOldest: {
    id: 'register.workQueue.selects.sort.item1',
    defaultMessage: 'Newest to oldest',
    description: 'Label for the sort by newest to oldest option'
  },
  filtersFilterBy: {
    id: 'register.workQueue.labels.selects.filter',
    defaultMessage: 'Sort By',
    description: 'Label for the sort by section of the filters'
  },
  filtersAllEvents: {
    id: 'register.workQueue.labels.events.all',
    defaultMessage: 'All life events',
    description: 'Label for the filter by all events option'
  },
  filtersBirth: {
    id: 'register.workQueue.labels.events.birth',
    defaultMessage: 'Birth',
    description: 'Label for the filter by birth option'
  },
  filtersDeath: {
    id: 'register.workQueue.labels.events.death',
    defaultMessage: 'Death',
    description: 'Label for the filter by death option'
  },
  filtersMarriage: {
    id: 'register.workQueue.labels.events.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for the filter by marriage option'
  },
  filtersAllStatuses: {
    id: 'register.workQueue.labels.statuses.all',
    defaultMessage: 'All statues',
    description: 'Label for the filter by all statuses option'
  },
  filtersApplication: {
    id: 'register.workQueue.labels.statuses.application',
    defaultMessage: 'Application',
    description: 'Label for the filter by application option'
  },
  filtersRegistered: {
    id: 'register.workQueue.labels.statuses.registered',
    defaultMessage: 'Registered',
    description: 'Label for the filter by registered option'
  },
  filtersCollected: {
    id: 'register.workQueue.labels.statuses.collected',
    defaultMessage: 'Collected',
    description: 'Label for the filter by collected option'
  },
  filtersAllLocations: {
    id: 'register.workQueue.labels.locations.all',
    defaultMessage: 'All locations',
    description: 'Label for filtering by all locations'
  },
  listItemName: {
    id: 'register.workQueue.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemDob: {
    id: 'register.workQueue.labels.results.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  listItemDateOfApplication: {
    id: 'register.workQueue.labels.results.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Label for date of application in work queue list item'
  },
  listItemTrackingNumber: {
    id: 'register.workQueue.labels.results.trackingID',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in work queue list item'
  },
  newRegistration: {
    id: 'register.workQueue.buttons.newRegistration',
    defaultMessage: 'New birth registration',
    description: 'The title of new registration button'
  },
  newApplication: {
    id: 'register.workQueue.buttons.newApplication',
    defaultMessage: 'New Birth Application',
    description: 'The title of new application button'
  },
  reviewAndRegister: {
    id: 'register.workQueue.buttons.reviewAndRegister',
    defaultMessage: 'Review and Register',
    description:
      'The title of review and register button in expanded area of list item'
  },
  review: {
    id: 'register.workQueue.list.buttons.review',
    defaultMessage: 'Review',
    description: 'The title of review button in list item actions'
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
  margin-top: -30px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
const StyledPlusIcon = styled(Plus)`
  display: flex;
  margin-left: -23px;
`
const StyledIconAction = styled(IconAction)`
  display: flex;
  min-height: 96px;
  padding: 0 20px 0 0;
  box-shadow: 0 0 12px 1px rgba(0, 0, 0, 0.22);
  background-color: ${({ theme }) => theme.colors.accentLight};

  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    font-size: 28px;
    font-weight: 300;
    margin: -2px 0 -2px 120px;
    line-height: 1.3em;
    color: ${({ theme }) => theme.colors.white};
  }
`

interface IBaseWorkQueueProps {
  theme: ITheme
  language: string
  scope: Scope
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails
}

type IWorkQueueProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseWorkQueueProps

export class WorkQueueView extends React.Component<IWorkQueueProps> {
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
      const namesMap = names.filter(Boolean).reduce((prevNamesMap, name) => {
        if (!name.use) {
          /* tslint:disable:no-string-literal */
          prevNamesMap['default'] = `${name.firstNames} ${
            /* tslint:enable:no-string-literal */
            name.familyName
          }`.trim()
          return prevNamesMap
        }

        prevNamesMap[name.use] = `${name.firstNames} ${name.familyName}`.trim()
        return prevNamesMap
      }, {})

      return {
        name:
          (namesMap[this.props.language] as string) ||
          /* tslint:disable:no-string-literal */
          (namesMap['default'] as string) ||
          /* tslint:enable:no-string-literal */
          '',
        dob: (reg.child && reg.child.birthDate) || '',
        date_of_application: moment(reg.createdAt).format('YYYY-MM-DD'),
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

    const listItemActions = [
      {
        label: this.props.intl.formatMessage(messages.review),
        handler: () => console.log('TO DO')
      }
    ]

    const expansionActions: JSX.Element[] = []
    if (this.userHasRegisterScope()) {
      expansionActions.push(
        <PrimaryButton
          id={`reviewAndRegisterBtn_${item.tracking_id}`}
          onClick={() => console.log('TO DO')}
        >
          {this.props.intl.formatMessage(messages.reviewAndRegister)}
        </PrimaryButton>
      )
    }

    return (
      <ListItem
        index={key}
        infoItems={info}
        statusItems={status}
        key={key}
        itemData={{}}
        actions={listItemActions}
        expandedCellRenderer={() => (
          <ListItemExpansion actions={expansionActions}>
            <p>Expansion content</p>
          </ListItemExpansion>
        )}
      />
    )
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasDeclareScope() {
    return this.props.scope && this.props.scope.includes('declare')
  }

  getUnionId() {
    const area = this.props.userDetails && this.props.userDetails.catchmentArea
    const identifier =
      area &&
      area.find((location: ILocation) => {
        return (
          (location.identifier &&
            location.identifier.find((areaIdentifier: IIdentifier) => {
              return (
                areaIdentifier.system.endsWith('jurisdiction-type') &&
                areaIdentifier.value === 'UNION'
              )
            })) !== undefined
        )
      })

    return identifier && identifier.id
  }

  getNewEventButtonText() {
    if (this.userHasRegisterScope()) {
      return messages.newRegistration
    } else if (this.userHasDeclareScope()) {
      return messages.newApplication
    } else {
      return messages.newApplication
    }
  }

  render() {
    const { intl, theme } = this.props

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
            value: '',
            type: SelectFieldType.Date
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
                value: '',
                label: intl.formatMessage(messages.filtersAllEvents)
              },
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
                value: '',
                label: intl.formatMessage(messages.filtersAllStatuses)
              },
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
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllLocations)
              },
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
            id="work_queue_view"
            title={intl.formatMessage(messages.headerTitle)}
            description={intl.formatMessage(messages.headerDescription)}
            {...this.props}
          />
        </HomeViewHeader>
        <Container>
          (
          <Query
            query={FETCH_REGISTRATION_QUERY}
            variables={{ locationIds: [this.getUnionId()] }}
          >
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  <StyledSpinner
                    id="work-queue-spinner"
                    baseColor={theme.colors.background}
                  />
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
                  <StyledIconAction
                    id="new_registration"
                    icon={() => <StyledPlusIcon />}
                    onClick={this.props.goToEvents}
                    title={intl.formatMessage(this.getNewEventButtonText())}
                  />
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
          )
        </Container>
      </>
    )
  }
}

export const WorkQueue = connect(
  (state: IStoreState) => ({
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: state.profile.userDetails
  }),
  { goToEvents: goToEventsAction }
)(injectIntl(withTheme(WorkQueueView)))
