import { Duplicate, Validate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable,
  IAction
} from '@opencrvs/components/lib/interface'
import { HomeContent } from '@opencrvs/components/lib/layout'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import {
  goToPage,
  goToReviewDuplicate,
  goToApplicationDetails
} from '@register/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'
import { getScope } from '@register/profile/profileSelectors'
import { transformData } from '@register/search/transformer'
import { IStoreState } from '@register/store'
import styled, { ITheme } from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import {
  ErrorText,
  EVENT_STATUS,
  StyledSpinner
} from '@register/views/RegistrationHome/RegistrationHome'
import { RowHistoryView } from '@register/views/RegistrationHome/RowHistoryView'
import ReactTooltip from 'react-tooltip'
import { errorMessages, constantsMessages } from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/registrarHome'
import { IApplication, SUBMISSION_STATUS } from '@register/applications'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseReviewTabProps {
  theme: ITheme
  scope: Scope | null
  goToPage: typeof goToPage
  goToReviewDuplicate: typeof goToReviewDuplicate
  registrarLocationId: string | null
  goToApplicationDetails: typeof goToApplicationDetails
  outboxApplications: IApplication[]
  queryData: {
    loading: boolean
    error: Error | undefined
    data: GQLEventSearchResultSet
  }
  page: number
  onPageChange: (newPageNumber: number) => void
}

interface IReviewTabState {
  width: number
}

type IReviewTabProps = IntlShapeProps & IBaseReviewTabProps

class ReviewTabComponent extends React.Component<
  IReviewTabProps,
  IReviewTabState
> {
  pageSize = 10
  constructor(props: IReviewTabProps) {
    super(props)
    this.state = {
      width: window.innerWidth
    }
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

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  transformDeclaredContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(
      data,
      this.props.intl,
      this.props.outboxApplications,
      [SUBMISSION_STATUS.READY_TO_REGISTER, SUBMISSION_STATUS.REGISTERING]
    )
    return transformedData.map(reg => {
      const actions = [] as IAction[]
      let icon: JSX.Element = <div />
      if (reg.duplicates && reg.duplicates.length > 0) {
        actions.push({
          label: this.props.intl.formatMessage(constantsMessages.review),
          handler: () => this.props.goToReviewDuplicate(reg.id)
        })
        icon = <Duplicate />
      } else {
        if (reg.declarationStatus === EVENT_STATUS.VALIDATED) {
          icon = <Validate data-tip data-for="validateTooltip" />
        }
        actions.push({
          label: this.props.intl.formatMessage(constantsMessages.review),
          handler: () =>
            this.props.goToPage(
              REVIEW_EVENT_PARENT_FORM_PAGE,
              reg.id,
              'review',
              reg.event ? reg.event.toLowerCase() : ''
            )
        })
      }

      return {
        ...reg,
        eventTimeElapsed:
          (reg.dateOfEvent &&
            moment(reg.dateOfEvent.toString(), 'YYYY-MM-DD').fromNow()) ||
          '',
        applicationTimeElapsed:
          (reg.createdAt &&
            moment(
              moment(reg.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          '',
        actions,
        icon,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () => this.props.goToApplicationDetails(reg.id)
          }
        ]
      }
    })
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
          label: this.props.intl.formatMessage(constantsMessages.trackingId),
          width: 20,
          key: 'trackingId'
        },
        {
          label: this.props.intl.formatMessage(
            messages.listItemApplicationDate
          ),
          width: 20,
          key: 'applicationTimeElapsed'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
          width: 20,
          key: 'eventTimeElapsed'
        },
        {
          width: 6,
          key: 'icons',
          isIconColumn: true
        },
        {
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
          label: this.props.intl.formatMessage(constantsMessages.trackingId),
          width: 64,
          key: 'trackingId'
        },
        {
          width: 6,
          key: 'icons',
          isIconColumn: true
        }
      ]
    }
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  render() {
    const { theme, intl, queryData, page, onPageChange } = this.props
    const { loading, error, data } = queryData

    if (loading) {
      return (
        <StyledSpinner
          id="search-result-spinner"
          baseColor={theme.colors.background}
        />
      )
    }
    if (error) {
      Sentry.captureException(error)
      return (
        <ErrorText id="search-result-error-text-review">
          {intl.formatMessage(errorMessages.queryError)}
        </ErrorText>
      )
    }

    return (
      <HomeContent>
        <ReactTooltip id="validateTooltip">
          <ToolTipContainer>
            {this.props.intl.formatMessage(
              messages.validatedApplicationTooltipForRegistrar
            )}
          </ToolTipContainer>
        </ReactTooltip>
        <GridTable
          content={this.transformDeclaredContent(data)}
          columns={this.getColumns()}
          renderExpandedComponent={this.renderExpandedComponent}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
          onPageChange={onPageChange}
          pageSize={this.pageSize}
          totalItems={(data && data.totalItems) || 0}
          currentPage={page}
          expandable={this.getExpandable()}
          clickable={!this.getExpandable()}
        />
      </HomeContent>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state),
    outboxApplications: state.applicationsState.applications
  }
}

export const ReviewTab = connect(
  mapStateToProps,
  {
    goToPage,
    goToReviewDuplicate,
    goToApplicationDetails
  }
)(injectIntl(withTheme(ReviewTabComponent)))
