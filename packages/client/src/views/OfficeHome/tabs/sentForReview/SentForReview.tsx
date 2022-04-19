/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import {
  GridTable,
  ColumnContentAlignment,
  Spinner
} from '@opencrvs/components/lib/interface'
import {
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/interface/GridTable/GridTable'

import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import {
  SUBMISSION_STATUS,
  IDeclaration,
  deleteDeclaration
} from '@client/declarations'
import {
  StatusSubmitted,
  StatusFailed24 as StatusFailed,
  StatusWaiting,
  StatusPendingOffline,
  DeclarationIcon
} from '@opencrvs/components/lib/icons'
import { getTheme } from '@opencrvs/components/lib/theme'
import { calculateDaysFromToday } from '@client/views/PrintCertificate/utils'
import { goToDeclarationRecordAudit } from '@client/navigation'
import {
  constantsMessages as messages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import { getDefaultLanguage } from '@client/i18n/utils'
import { withTheme, ITheme } from '@client/styledComponents'
import { getDraftInformantFullName } from '@client/utils/draftUtils'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { officeHomeMessages } from '@client/i18n/messages/views/officeHome'
import { formattedDuration } from '@client/utils/date-formatting'
import { Event } from '@client/forms'
import { STATUSTOCOLOR } from '@client/views/Home/RecordAudit'
import {
  getIconWithName,
  getIconWithNameEvent,
  getSortedItems
} from '@client/views/OfficeHome/tabs/utils'

const DECLARATIONS_DAY_LIMIT = 7

interface ISentForReviewProps {
  theme: ITheme
  declarationsReadyToSend: IDeclaration[]
  deleteDeclaration: typeof deleteDeclaration
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  showPaginated?: boolean
  loading?: boolean
  error?: boolean
}

interface IState {
  sentForReviewPageNo: number
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
}

type IFullProps = ISentForReviewProps & IntlShapeProps

class SentForReviewComponent extends React.Component<IFullProps, IState> {
  pageSize: number

  constructor(props: IFullProps) {
    super(props)

    this.pageSize = 10
    this.state = {
      width: window.innerWidth,
      sentForReviewPageNo: 1,
      sortedCol: COLUMNS.ICON_WITH_NAME,
      sortOrder: SORT_ORDER.ASCENDING
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
    let overwriteStatusIfOffline = true
    let iconId: string
    switch (status) {
      case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTING]:
        iconId = `submitting${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]:
      case SUBMISSION_STATUS[SUBMISSION_STATUS.DECLARED]:
        overwriteStatusIfOffline = false
        iconId = `submitted${index}`
        icon = () => <StatusSubmitted id={iconId} key={iconId} />
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]:
        overwriteStatusIfOffline = false
        iconId = `failed${index}`
        icon = () => <StatusFailed id={iconId} key={iconId} />
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_SUBMIT]:
      default:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        break
    }

    if (!online && overwriteStatusIfOffline) {
      iconId = `offline${index}`
      icon = () => <StatusPendingOffline id={iconId} key={iconId} />
    }

    return {
      icon
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
    this.props.declarationsReadyToSend
      .filter(
        (declaration: IDeclaration) =>
          declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED] &&
          declaration.modifiedOn &&
          calculateDaysFromToday(
            new Date(declaration.modifiedOn).toISOString().split('T')[0]
          ) > DECLARATIONS_DAY_LIMIT
      )
      .forEach((declaration) => {
        this.props.deleteDeclaration(declaration)
      })
  }

  transformDeclarationsReadyToSend = () => {
    if (
      !this.props.declarationsReadyToSend ||
      this.props.declarationsReadyToSend.length <= 0
    ) {
      return []
    }
    const items = this.props.declarationsReadyToSend.map(
      (draft: IDeclaration, index) => {
        const { intl } = this.props
        const { locale } = intl
        const name = getDraftInformantFullName(draft, locale)
        const event =
          (draft.event &&
            intl.formatMessage(
              dynamicConstantsMessages[draft.event.toLowerCase()]
            )) ||
          ''
        const { icon } = this.submissionStatusMap(
          draft.submissionStatus || '',
          navigator.onLine,
          index,
          draft.trackingId
        )
        const date =
          draft &&
          (draft.event === Event.BIRTH
            ? draft.data.child?.childBirthDate
            : draft.data.deathEvent?.deathDate ||
              draft.data.deceased?.deathDate)
        const savedDate =
          draft && draft.savedOn
            ? new Date(draft.savedOn)
            : draft.createdAt && parseInt(draft.createdAt)
        return {
          id: draft.id,
          event: event || '',
          name: name.toLowerCase(),
          iconWithName: getIconWithName(
            (draft && draft.submissionStatus) || SUBMISSION_STATUS.DRAFT,
            name
          ),
          iconWithNameEvent: getIconWithNameEvent(
            (draft && draft.submissionStatus) || SUBMISSION_STATUS.DRAFT,
            name,
            event
          ),
          dateOfEvent: date ? new Date(date as string) : '',
          sentForReview: savedDate ? savedDate : '',
          statusIndicator: icon ? [icon()] : null,
          rowClickable: Boolean(draft.compositionId),
          rowClickHandler: [
            {
              label: 'rowClickHandler',
              handler: () => {
                if (!draft.compositionId) {
                  throw new Error(
                    'No composition id found for this declaration'
                  )
                }
                this.props.goToDeclarationRecordAudit(
                  'reviewTab',
                  draft.compositionId
                )
              }
            }
          ]
        }
      }
    )
    const sortedItems = getSortedItems(
      items,
      this.state.sortedCol,
      this.state.sortOrder
    ).map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        sentForReview:
          item.sentForReview && formattedDuration(item.sentForReview as Date)
      }
    })
    return sortedItems
  }

  onPageChange = (pageNumber: number) => {
    this.setState({ sentForReviewPageNo: pageNumber })
  }

  sortFunction = (columnName: string) => {
    let sortedCol: COLUMNS
    let sortOrder: SORT_ORDER = SORT_ORDER.ASCENDING
    switch (columnName) {
      case COLUMNS.ICON_WITH_NAME:
        sortedCol = COLUMNS.NAME
        break
      case COLUMNS.EVENT:
        sortedCol = COLUMNS.EVENT
        break
      case COLUMNS.DATE_OF_EVENT:
        sortedCol = COLUMNS.DATE_OF_EVENT
        break
      case COLUMNS.SENT_FOR_REVIEW:
        sortedCol = COLUMNS.SENT_FOR_REVIEW
        break
      case COLUMNS.DATE_OF_EVENT:
        sortedCol = COLUMNS.DATE_OF_EVENT
        break
      default:
        sortedCol = COLUMNS.NAME
    }

    if (this.state.sortedCol === sortedCol) {
      if (this.state.sortOrder === SORT_ORDER.ASCENDING) {
        sortOrder = SORT_ORDER.DESCENDING
      } else {
        sortOrder = SORT_ORDER.ASCENDING
      }
    } else {
      sortOrder = SORT_ORDER.ASCENDING
    }

    this.setState({
      sortOrder: sortOrder,
      sortedCol: sortedCol
    })
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
          width: 40,
          label: this.props.intl.formatMessage(messages.name),
          key: COLUMNS.ICON_WITH_NAME,
          errorValue: this.props.intl.formatMessage(messages.noNameProvided),
          isSorted: this.state.sortedCol === COLUMNS.ICON_WITH_NAME,
          sortFunction: this.sortFunction
        },
        {
          label: this.props.intl.formatMessage(messages.event),
          width: 10,
          key: COLUMNS.EVENT,
          isSorted: this.state.sortedCol === COLUMNS.EVENT,
          sortFunction: this.sortFunction
        },
        {
          label: this.props.intl.formatMessage(messages.dateOfEvent),
          width: 20,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: this.state.sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: this.sortFunction
        },
        {
          label: this.props.intl.formatMessage(messages.sentForReview),
          width: 20,
          key: COLUMNS.SENT_FOR_REVIEW,
          isSorted: this.state.sortedCol === COLUMNS.SENT_FOR_REVIEW,
          sortFunction: this.sortFunction
        },
        {
          width: 10,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.STATUS_INDICATOR
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(messages.name),
          width: 90,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          label: '',
          width: 10,
          alignment: ColumnContentAlignment.CENTER,
          key: COLUMNS.STATUS_INDICATOR
        }
      ]
    }
  }

  render() {
    const { intl, declarationsReadyToSend } = this.props

    return (
      <Content
        size={ContentSize.LARGE}
        title={intl.formatMessage(navigationMessages.sentForReview)}
        hideBackground={true}
      >
        <GridTable
          content={this.transformDeclarationsReadyToSend()}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(officeHomeMessages.sentForReview)}
          totalItems={declarationsReadyToSend && declarationsReadyToSend.length}
          onPageChange={this.onPageChange}
          pageSize={this.pageSize}
          currentPage={this.state.sentForReviewPageNo}
          showPaginated={this.props.showPaginated}
          loadMoreText={intl.formatMessage(messages.loadMore)}
        />
        {/* <Pagination /> */}
        <LoadingIndicator loading={false} hasError={false} />
      </Content>
    )
  }
}

export const SentForReview = connect(null, {
  deleteDeclaration,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(SentForReviewComponent)))
