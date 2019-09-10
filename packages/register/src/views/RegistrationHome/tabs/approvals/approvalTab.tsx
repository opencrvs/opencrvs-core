import { Validate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface'
import { HomeContent } from '@opencrvs/components/lib/layout'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import { goToPage, goToApplicationDetails } from '@register/navigation'
import { getScope } from '@register/profile/profileSelectors'
import { transformData } from '@register/search/transformer'
import { IStoreState } from '@register/store'
import styled, { ITheme } from '@register/styledComponents'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import {
  ErrorText,
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
interface IBaseApprovalTabProps {
  theme: ITheme
  goToPage: typeof goToPage
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

interface IApprovalTabState {
  width: number
}

type IApprovalTabProps = IntlShapeProps & IBaseApprovalTabProps

class ApprovalTabComponent extends React.Component<
  IApprovalTabProps,
  IApprovalTabState
> {
  pageSize = 10
  constructor(props: IApprovalTabProps) {
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
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
          width: 28,
          key: 'eventTimeElapsed'
        },
        {
          label: this.props.intl.formatMessage(messages.sentForApprovals),
          width: 28,
          key: 'dateOfApproval'
        },
        {
          width: 5,
          key: 'icons',
          isIconColumn: true
        },
        {
          width: 5,
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

  transformValidatedContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(
      data,
      this.props.intl,
      this.props.outboxApplications,
      [SUBMISSION_STATUS.READY_TO_APPROVE, SUBMISSION_STATUS.APPROVING]
    )

    return transformedData.map(reg => {
      const icon: JSX.Element = (
        <Validate data-tip data-for="validatedTooltip" />
      )
      return {
        ...reg,
        eventTimeElapsed:
          (reg.dateOfEvent &&
            moment(reg.dateOfEvent.toString(), 'YYYY-MM-DD').fromNow()) ||
          '',
        dateOfApproval:
          (reg.modifiedAt &&
            moment(
              moment(reg.modifiedAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          (reg.createdAt &&
            moment(
              moment(reg.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          '',
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
        <ErrorText id="search-result-error-text-approvals">
          {intl.formatMessage(errorMessages.queryError)}
        </ErrorText>
      )
    }
    return (
      <HomeContent>
        <ReactTooltip id="validatedTooltip">
          <ToolTipContainer>
            {this.props.intl.formatMessage(
              messages.validatedApplicationTooltipForRegistrationAgent
            )}
          </ToolTipContainer>
        </ReactTooltip>
        <GridTable
          content={this.transformValidatedContent(data)}
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

export const ApprovalTab = connect(
  mapStateToProps,
  {
    goToPage,
    goToApplicationDetails
  }
)(injectIntl(withTheme(ApprovalTabComponent)))
