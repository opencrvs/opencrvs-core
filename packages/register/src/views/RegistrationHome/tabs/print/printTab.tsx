import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface'
import { BodyWrapper } from '@opencrvs/components/lib/layout'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema'
import { goToPrintCertificate } from '@register/navigation'
import { transformData } from '@register/search/transformer'
import { ITheme } from '@register/styledComponents'
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

interface IBasePrintTabProps {
  theme: ITheme
  goToPrintCertificate: typeof goToPrintCertificate
  registrarUnion: string | null
  parentQueryLoading?: boolean
}

interface IPrintTabState {
  printCurrentPage: number
}

type IPrintTabProps = InjectedIntlProps & IBasePrintTabProps

class PrintTabComponent extends React.Component<
  IPrintTabProps,
  IPrintTabState
> {
  pageSize = 10
  constructor(props: IPrintTabProps) {
    super(props)
    this.state = {
      printCurrentPage: 1
    }
  }

  transformRegisterdContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }

    const transformedData = transformData(data, this.props.intl)
    return transformedData.map(reg => {
      const actions = [
        {
          label: this.props.intl.formatMessage(messages.print),
          handler: () =>
            this.props.goToPrintCertificate(
              reg.id,
              reg.event.toLocaleLowerCase() || ''
            )
        }
      ]
      return {
        ...reg,
        dateOfRegistration:
          (reg.modifiedAt &&
            moment(
              moment(reg.modifiedAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          ((reg.createdAt &&
            moment(
              moment(reg.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
            ''),
        actions
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ printCurrentPage: newPageNumber })
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
          status: [EVENT_STATUS.REGISTERED],
          locationIds: [registrarUnion],
          count: this.pageSize,
          skip: (this.state.printCurrentPage - 1) * this.pageSize
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
                  id="search-result-spinner-print"
                  baseColor={theme.colors.background}
                />
              )) ||
              null
            )
          }
          if (error) {
            Sentry.captureException(error)
            return (
              <ErrorText id="search-result-error-text-print">
                {intl.formatMessage(messages.queryError)}
              </ErrorText>
            )
          }
          return (
            <BodyWrapper>
              <GridTable
                content={this.transformRegisterdContent(data)}
                columns={[
                  {
                    label: this.props.intl.formatMessage(messages.listItemType),
                    width: 14,
                    key: 'event'
                  },
                  {
                    label: this.props.intl.formatMessage(messages.listItemName),
                    width: 25,
                    key: 'name'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemRegisteredDate
                    ),
                    width: 24,
                    key: 'dateOfRegistration'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.registrationNumber
                    ),
                    width: 25,
                    key: 'registrationNumber'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemAction
                    ),
                    width: 12,
                    key: 'actions',
                    alignment: ColumnContentAlignment.CENTER,
                    isActionColumn: true
                  }
                ]}
                renderExpandedComponent={this.renderExpandedComponent}
                noResultText={intl.formatMessage(messages.dataTableNoResults)}
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalItems={data.searchEvents && data.searchEvents.totalItems}
                currentPage={this.state.printCurrentPage}
                expandable={true}
              />
            </BodyWrapper>
          )
        }}
      </Query>
    )
  }
}

export const PrintTab = connect(
  null,
  {
    goToPrintCertificate: goToPrintCertificate
  }
)(injectIntl(withTheme(PrintTabComponent)))
