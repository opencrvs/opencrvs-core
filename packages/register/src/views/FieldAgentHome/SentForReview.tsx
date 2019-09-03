import * as React from 'react'
import { HomeContent } from '@opencrvs/components/lib/layout'
import {
  GridTable,
  ColumnContentAlignment,
  Spinner
} from '@opencrvs/components/lib/interface'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import {
  SUBMISSION_STATUS,
  IApplication,
  deleteApplication
} from '@register/applications'
import {
  StatusSubmitted,
  StatusFailed24 as StatusFailed,
  StatusWaiting,
  StatusPendingOffline
} from '@opencrvs/components/lib/icons'
import { sentenceCase } from '@register/utils/data-formatting'
import { getTheme } from '@opencrvs/components/lib/theme'
import { calculateDays } from '@register/views/PrintCertificate/utils'
import { goToApplicationDetails } from '@register/navigation'
import { constantsMessages as messages } from '@register/i18n/messages'
import { getDefaultLanguage } from '@register/i18n/utils'
import { withTheme, ITheme } from '@register/styledComponents'

const APPLICATIONS_DAY_LIMIT = 7

interface ISentForReviewProps {
  theme: ITheme
  applicationsReadyToSend: IApplication[]
  deleteApplication: typeof deleteApplication
  goToApplicationDetails: typeof goToApplicationDetails
}

interface IState {
  sentForReviewPageNo: number
  width: number
}

type IFullProps = ISentForReviewProps & IntlShapeProps

class SentForReviewComponent extends React.Component<IFullProps, IState> {
  pageSize: number

  constructor(props: IFullProps) {
    super(props)

    this.pageSize = 10
    this.state = {
      width: window.innerWidth,
      sentForReviewPageNo: 1
    }
  }

  submissionStatusMap = (
    status: string,
    online: boolean,
    index: number,
    id?: string
  ) => {
    const { formatMessage } = this.props.intl
    const { waitingToSend, sending, failedToSend, pendingConnection } = messages

    let icon: () => React.ReactNode
    let statusText: string
    let overwriteStatusIfOffline = true
    let iconId: string
    switch (status) {
      case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTING]:
        iconId = `submitting${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(sending)
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]:
        overwriteStatusIfOffline = false
        iconId = `submitted${index}`
        icon = () => <StatusSubmitted id={iconId} key={iconId} />
        statusText = id || ''
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]:
        overwriteStatusIfOffline = false
        iconId = `failed${index}`
        icon = () => <StatusFailed id={iconId} key={iconId} />
        statusText = formatMessage(failedToSend)
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_SUBMIT]:
      default:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(waitingToSend)
        break
    }

    if (!online && overwriteStatusIfOffline) {
      iconId = `offline${index}`
      icon = () => <StatusPendingOffline id={iconId} key={iconId} />
      statusText = formatMessage(pendingConnection)
    }

    return {
      icon,
      statusText
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
    this.props.applicationsReadyToSend
      .filter(
        (application: IApplication) =>
          application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED] &&
          application.modifiedOn &&
          calculateDays(
            new Date(application.modifiedOn).toISOString().split('T')[0]
          ) > APPLICATIONS_DAY_LIMIT
      )
      .forEach(this.props.deleteApplication)
  }

  transformApplicationsReadyToSend = () => {
    if (
      !this.props.applicationsReadyToSend ||
      this.props.applicationsReadyToSend.length <= 0
    ) {
      return []
    }
    return this.props.applicationsReadyToSend.map(
      (draft: IApplication, index) => {
        let name

        if (draft.event && draft.event.toString() === 'birth') {
          name =
            (draft.data &&
              draft.data.child &&
              draft.data.child.familyNameEng &&
              (!draft.data.child.firstNamesEng
                ? ''
                : draft.data.child.firstNamesEng + ' ') +
                draft.data.child.familyNameEng) ||
            (draft.data &&
              draft.data.child &&
              draft.data.child.familyName &&
              (!draft.data.child.firstNames
                ? ''
                : draft.data.child.firstNames + ' ') +
                draft.data.child.familyName) ||
            ''
        } else if (draft.event && draft.event.toString() === 'death') {
          name =
            (draft.data &&
              draft.data.deceased &&
              draft.data.deceased.familyNameEng &&
              (!draft.data.deceased.firstNamesEng
                ? ''
                : draft.data.deceased.firstNamesEng + ' ') +
                draft.data.deceased.familyNameEng) ||
            (draft.data &&
              draft.data.deceased &&
              draft.data.deceased.familyName &&
              (!draft.data.deceased.firstNames
                ? ''
                : draft.data.deceased.firstNames + ' ') +
                draft.data.deceased.familyName) ||
            ''
        }

        const { statusText, icon } = this.submissionStatusMap(
          draft.submissionStatus || '',
          navigator.onLine,
          index,
          draft.trackingId
        )
        return {
          id: draft.id,
          event: (draft.event && sentenceCase(draft.event)) || '',
          name: name || '',
          submissionStatus: statusText || '',
          statusIndicator: icon ? [icon()] : null,
          rowClickHandler: [
            {
              label: 'rowClickHandler',
              handler: () => {
                if (!draft.compositionId) {
                  throw new Error(
                    'No composition id found for this application'
                  )
                }
                this.props.goToApplicationDetails(draft.compositionId)
              }
            }
          ]
        }
      }
    )
  }

  onPageChange = (pageNumber: number) => {
    this.setState({ sentForReviewPageNo: pageNumber })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(messages.type),
          width: 15,
          key: 'event'
        },
        {
          width: 45,
          label: this.props.intl.formatMessage(messages.name),
          key: 'name'
        },
        {
          label: this.props.intl.formatMessage(messages.submissionStatus),
          width: 35,
          key: 'submissionStatus',
          color: getTheme(getDefaultLanguage()).colors.secondaryLabel
        },
        {
          label: '',
          width: 5,
          alignment: ColumnContentAlignment.CENTER,
          key: 'statusIndicator'
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(messages.type),
          width: 30,
          key: 'event'
        },
        {
          width: 65,
          label: this.props.intl.formatMessage(messages.name),
          key: 'name'
        },
        {
          label: '',
          width: 5,
          alignment: ColumnContentAlignment.CENTER,
          key: 'statusIndicator'
        }
      ]
    }
  }

  render() {
    const { intl, applicationsReadyToSend } = this.props

    return (
      <HomeContent>
        <GridTable
          content={this.transformApplicationsReadyToSend()}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(messages.noResults)}
          totalItems={applicationsReadyToSend && applicationsReadyToSend.length}
          onPageChange={this.onPageChange}
          pageSize={this.pageSize}
          clickable={true}
          currentPage={this.state.sentForReviewPageNo}
        />
      </HomeContent>
    )
  }
}

export const SentForReview = connect(
  null,
  { deleteApplication, goToApplicationDetails }
)(injectIntl(withTheme(SentForReviewComponent)))
