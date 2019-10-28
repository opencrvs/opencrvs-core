import {
  ColumnContentAlignment,
  GridTable,
  IAction
} from '@opencrvs/components/lib/interface'
import { HomeContent } from '@opencrvs/components/lib/layout'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import {
  goToPrintCertificate,
  goToApplicationDetails
} from '@register/navigation'
import { transformData } from '@register/search/transformer'
import { ITheme } from '@register/styledComponents'
import moment from 'moment'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import { RowHistoryView } from '@register/views/RegistrationHome/RowHistoryView'
import { buttonMessages, constantsMessages } from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/registrarHome'
import { IStoreState } from '@register/store'
import { IApplication, DOWNLOAD_STATUS } from '@register/applications'
import { Download } from '@opencrvs/components/lib/icons'

interface IBasePrintTabProps {
  theme: ITheme
  goToPrintCertificate: typeof goToPrintCertificate
  registrarLocationId: string | null
  goToApplicationDetails: typeof goToApplicationDetails
  outboxApplications: IApplication[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  page: number
  onPageChange: (newPageNumber: number) => void
}

interface IPrintTabState {
  width: number
}

type IPrintTabProps = IntlShapeProps & IBasePrintTabProps

class PrintTabComponent extends React.Component<
  IPrintTabProps,
  IPrintTabState
> {
  pageSize = 10
  constructor(props: IPrintTabProps) {
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
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 25,
          key: 'name'
        },
        {
          label: this.props.intl.formatMessage(messages.listItemRegisteredDate),
          width: 16,
          key: 'dateOfRegistration'
        },
        {
          label: this.props.intl.formatMessage(messages.registrationNumber),
          width: 25,
          key: 'registrationNumber'
        },
        {
          label: this.props.intl.formatMessage(messages.listItemAction),
          width: 20,
          key: 'actions',
          alignment: ColumnContentAlignment.CENTER,
          isActionColumn: true
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

  transformRegisteredContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, this.props.intl)
    return transformedData.map(reg => {
      const foundApplication = this.props.outboxApplications.find(
        application => application.id === reg.id
      )
      const actions: IAction[] = []
      const downloadStatus =
        (foundApplication && foundApplication.downloadStatus) || undefined

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        actions.push({
          label: '',
          icon: () => <Download />,
          handler: () => {
            console.log('To dispatch download action')
          },
          loading: downloadStatus === DOWNLOAD_STATUS.DOWNLOADING,
          error: downloadStatus === DOWNLOAD_STATUS.FAILED,
          loadingLabel: this.props.intl.formatMessage(
            constantsMessages.downloading
          )
        })
      } else {
        actions.push({
          label: this.props.intl.formatMessage(buttonMessages.print),
          handler: () =>
            this.props.goToPrintCertificate(
              reg.id,
              reg.event.toLocaleLowerCase() || ''
            )
        })
      }

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

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  render() {
    const { intl, queryData, page, onPageChange } = this.props
    const { data } = queryData

    return (
      <HomeContent>
        <GridTable
          content={this.transformRegisteredContent(data)}
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
    outboxApplications: state.applicationsState.applications
  }
}

export const PrintTab = connect(
  mapStateToProps,
  {
    goToPrintCertificate,
    goToApplicationDetails
  }
)(injectIntl(withTheme(PrintTabComponent)))
