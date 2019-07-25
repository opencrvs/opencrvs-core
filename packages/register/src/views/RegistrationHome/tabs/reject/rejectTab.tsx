import {
  ColumnContentAlignment,
  GridTable,
  IAction
} from '@opencrvs/components/lib/interface'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema'
import { goToPage, goToReviewDuplicate } from '@register/navigation'
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
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import { messages } from '@register/views/RegistrationHome/messages'
import { SEARCH_EVENTS } from '@register/views/RegistrationHome/queries'
import {
  ErrorText,
  EVENT_STATUS,
  StyledSpinner
} from '@register/views/RegistrationHome/RegistrationHome'
import { RowHistoryView } from '@register/views/RegistrationHome/RowHistoryView'

interface IBaseRejectTabProps {
  theme: ITheme
  scope: Scope | null
  goToPage: typeof goToPage
  goToReviewDuplicate: typeof goToReviewDuplicate
  registrarUnion: string | null
  parentQueryLoading?: boolean
}

interface IRejectTabState {
  updatesCurrentPage: number
}

type IRejectTabProps = InjectedIntlProps & IBaseRejectTabProps

class RejectTabComponent extends React.Component<
  IRejectTabProps,
  IRejectTabState
> {
  pageSize = 10
  constructor(props: IRejectTabProps) {
    super(props)
    this.state = {
      updatesCurrentPage: 1
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  transformRejectedContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)
    return transformedData.map(reg => {
      const actions = [] as IAction[]
      if (this.userHasRegisterScope()) {
        if (reg.duplicates && reg.duplicates.length > 0) {
          actions.push({
            label: this.props.intl.formatMessage(messages.reviewDuplicates),
            handler: () => this.props.goToReviewDuplicate(reg.id)
          })
        } else {
          actions.push({
            label: this.props.intl.formatMessage(messages.update),
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
        actions
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
    const { theme, intl, registrarUnion, parentQueryLoading } = this.props

    return (
      <Query
        query={SEARCH_EVENTS}
        variables={{
          status: [EVENT_STATUS.REJECTED],
          locationIds: [registrarUnion],
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
                {intl.formatMessage(messages.queryError)}
              </ErrorText>
            )
          }
          return (
            <BodyContent>
              <GridTable
                content={this.transformRejectedContent(data)}
                columns={[
                  {
                    label: this.props.intl.formatMessage(messages.listItemType),
                    width: 14,
                    key: 'event'
                  },
                  {
                    label: this.props.intl.formatMessage(messages.listItemName),
                    width: 23,
                    key: 'name'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemApplicantNumber
                    ),
                    width: 21,
                    key: 'contactNumber'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemUpdateDate
                    ),
                    width: 22,
                    key: 'dateOfRejection'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemAction
                    ),
                    width: 20,
                    key: 'actions',
                    isActionColumn: true,
                    alignment: ColumnContentAlignment.CENTER
                  }
                ]}
                renderExpandedComponent={this.renderExpandedComponent}
                noResultText={intl.formatMessage(messages.dataTableNoResults)}
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalItems={data.searchEvents && data.searchEvents.totalItems}
                currentPage={this.state.updatesCurrentPage}
                expandable={true}
              />
            </BodyContent>
          )
        }}
      </Query>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state)
  }
}

export const RejectTab = connect(
  mapStateToProps,
  {
    goToPage: goToPage,
    goToReviewDuplicate: goToReviewDuplicate
  }
)(injectIntl(withTheme(RejectTabComponent)))
