import {
  ColumnContentAlignment,
  GridTable,
  IAction
} from '@opencrvs/components/lib/interface'
import { HomeContent } from '@opencrvs/components/lib/layout'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema'
import {
  goToPage,
  goToReviewDuplicate,
  goToApplicationDetails
} from '@register/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'
import { getScope } from '@register/profile/profileSelectors'
import { transformData } from '@register/search/transformer'
import { IStoreState } from '@register/store'
import { ITheme } from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import { SEARCH_EVENTS } from '@register/views/RegistrationHome/queries'
import {
  ErrorText,
  EVENT_STATUS,
  StyledSpinner
} from '@register/views/RegistrationHome/RegistrationHome'
import { RowHistoryView } from '@register/views/RegistrationHome/RowHistoryView'
import {
  buttonMessages,
  errorMessages,
  constantsMessages
} from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/registrarHome'
import { IApplication, SUBMISSION_STATUS } from '@register/applications'

interface IBaseRejectTabProps {
  theme: ITheme
  scope: Scope | null
  goToPage: typeof goToPage
  goToReviewDuplicate: typeof goToReviewDuplicate
  registrarLocationId: string | null
  goToApplicationDetails: typeof goToApplicationDetails
  parentQueryLoading?: boolean
  outboxApplications: IApplication[]
}

interface IRejectTabState {
  updatesCurrentPage: number
  width: number
}

type IRejectTabProps = IntlShapeProps & IBaseRejectTabProps

class RejectTabComponent extends React.Component<
  IRejectTabProps,
  IRejectTabState
> {
  pageSize = 10
  constructor(props: IRejectTabProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      updatesCurrentPage: 1
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  getExpandable = () => {
    return this.state.width > this.props.theme.grid.breakpoints.lg
      ? true
      : false
  }

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 14,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 23,
          key: 'name'
        },
        {
          label: this.props.intl.formatMessage(
            constantsMessages.applicantContactNumber
          ),
          width: 21,
          key: 'contactNumber'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.sentOn),
          width: 22,
          key: 'dateOfRejection'
        },
        {
          label: this.props.intl.formatMessage(messages.listItemAction),
          width: 20,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.CENTER
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 30,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 70,
          key: 'name'
        }
      ]
    }
  }

  transformRejectedContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }
    const transformedData = transformData(
      data,
      this.props.intl,
      this.props.outboxApplications,
      [SUBMISSION_STATUS.READY_TO_REJECT, SUBMISSION_STATUS.REJECTING]
    )
    return transformedData.map(reg => {
      const actions = [] as IAction[]
      if (this.userHasRegisterScope()) {
        if (reg.duplicates && reg.duplicates.length > 0) {
          actions.push({
            label: this.props.intl.formatMessage(constantsMessages.review),
            handler: () => this.props.goToReviewDuplicate(reg.id)
          })
        } else {
          actions.push({
            label: this.props.intl.formatMessage(buttonMessages.update),
            handler: () =>
              this.props.goToPage(
                REVIEW_EVENT_PARENT_FORM_PAGE,
                reg.id,
                'review',
                reg.event ? reg.event.toLowerCase() : ''
              )
          })
        }
      }
      return {
        ...reg,
        dateOfRejection:
          (reg.modifiedAt &&
            moment(
              moment(reg.modifiedAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          '',
        actions,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () => this.props.goToApplicationDetails(reg.id)
          }
        ]
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ updatesCurrentPage: newPageNumber })
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  render() {
    const { theme, intl, registrarLocationId, parentQueryLoading } = this.props

    return (
      <Query
        query={SEARCH_EVENTS}
        variables={{
          status: [EVENT_STATUS.REJECTED],
          locationIds: [registrarLocationId],
          count: this.pageSize,
          skip: (this.state.updatesCurrentPage - 1) * this.pageSize
        }}
      >
        {({
          loading,
          error,
          data
        }: {
          loading: any
          error?: any
          data: any
        }) => {
          if (loading) {
            return (
              (!parentQueryLoading && (
                <StyledSpinner
                  id="search-result-spinner"
                  baseColor={theme.colors.background}
                />
              )) ||
              null
            )
          }
          if (error) {
            Sentry.captureException(error)
            return (
              <ErrorText id="search-result-error-text-reject">
                {intl.formatMessage(errorMessages.queryError)}
              </ErrorText>
            )
          }
          return (
            <HomeContent>
              <GridTable
                content={this.transformRejectedContent(data)}
                columns={this.getColumns()}
                renderExpandedComponent={this.renderExpandedComponent}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalItems={data.searchEvents && data.searchEvents.totalItems}
                currentPage={this.state.updatesCurrentPage}
                expandable={this.getExpandable()}
                clickable={!this.getExpandable()}
              />
            </HomeContent>
          )
        }}
      </Query>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state),
    outboxApplications: state.applicationsState.applications
  }
}

export const RejectTab = connect(
  mapStateToProps,
  {
    goToPage,
    goToReviewDuplicate,
    goToApplicationDetails
  }
)(injectIntl(withTheme(RejectTabComponent)))
