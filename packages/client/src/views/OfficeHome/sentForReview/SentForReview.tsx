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
  ColumnContentAlignment
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
import { calculateDaysFromToday } from '@client/views/PrintCertificate/utils'
import { goToDeclarationRecordAudit } from '@client/navigation'
import {
  constantsMessages as messages,
  dynamicConstantsMessages,
  constantsMessages
} from '@client/i18n/messages'
import { withTheme, ITheme } from '@client/styledComponents'
import { getDraftInformantFullName } from '@client/utils/draftUtils'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { formattedDuration } from '@client/utils/date-formatting'
import { Event } from '@client/forms'
import {
  getSortedItems,
  changeSortedColumn
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  IconWithNameEvent,
  SubmissionStatusMap,
  NoNameContainer
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { LinkButton } from '@opencrvs/components/lib/buttons/LinkButton'
const DECLARATIONS_DAY_LIMIT = 7

interface ISentForReviewProps {
  theme: ITheme
  declarationsReadyToSend: IDeclaration[]
  deleteDeclaration: typeof deleteDeclaration
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  paginationId: number
  pageSize: number
  onPageChange: (newPageNumber: number) => void
}

interface IState {
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
      sortedCol: COLUMNS.NAME,
      sortOrder: SORT_ORDER.ASCENDING
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
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

  onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      this.state.sortedCol,
      this.state.sortOrder
    )
    this.setState({
      sortOrder: newSortOrder,
      sortedCol: newSortedCol
    })
  }

  getReadyToSendPaginatedData = (drafts: IDeclaration[], pageId: number) => {
    return drafts.slice(
      (pageId - 1) * this.props.pageSize,
      pageId * this.props.pageSize
    )
  }

  transformDeclarationsReadyToSend = () => {
    if (
      !this.props.declarationsReadyToSend ||
      this.props.declarationsReadyToSend.length <= 0
    ) {
      return []
    }
    const paginatedDeclarations = this.getReadyToSendPaginatedData(
      this.props.declarationsReadyToSend,
      this.props.paginationId
    )
    const items = paginatedDeclarations.map((draft: IDeclaration, index) => {
      const { intl } = this.props
      const { locale } = intl
      const name = getDraftInformantFullName(draft, locale)
      const event =
        (draft.event &&
          intl.formatMessage(
            dynamicConstantsMessages[draft.event.toLowerCase()]
          )) ||
        ''

      const date =
        draft &&
        (draft.event === Event.BIRTH
          ? draft.data.child?.childBirthDate
          : draft.data.deathEvent?.deathDate || draft.data.deceased?.deathDate)
      const savedDate =
        draft && draft.savedOn
          ? new Date(draft.savedOn)
          : draft.createdAt && parseInt(draft.createdAt)
      const NameComponent = name ? (
        <LinkButton
          onClick={() => {
            if (!draft.compositionId) {
              throw new Error('No composition id found for this declaration')
            }
            this.props.goToDeclarationRecordAudit(
              'reviewTab',
              draft.compositionId
            )
          }}
        >
          {name}
        </LinkButton>
      ) : (
        <NoNameContainer
          onClick={() => {
            if (!draft.compositionId) {
              throw new Error('No composition id found for this declaration')
            }
            this.props.goToDeclarationRecordAudit(
              'reviewTab',
              draft.compositionId
            )
          }}
        >
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )
      return {
        id: draft.id,
        event: event || '',
        name: name && name.toLowerCase(),
        iconWithName: (
          <IconWithName
            status={
              (draft && draft.submissionStatus) || SUBMISSION_STATUS.DRAFT
            }
            name={NameComponent}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={
              (draft && draft.submissionStatus) || SUBMISSION_STATUS.DRAFT
            }
            name={NameComponent}
            event={event}
          />
        ),
        dateOfEvent: date ? new Date(date as string) : '',
        sentForReview: savedDate ? savedDate : '',
        actions: [
          {
            actionComponent: (
              <SubmissionStatusMap
                status={draft.submissionStatus || ''}
                online={navigator.onLine}
                index={index}
              />
            )
          }
        ]
      }
    })
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

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 30,
          label: this.props.intl.formatMessage(messages.name),
          key: COLUMNS.ICON_WITH_NAME,
          errorValue: this.props.intl.formatMessage(messages.noNameProvided),
          isSorted: this.state.sortedCol === COLUMNS.NAME,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(messages.event),
          width: 16,
          key: COLUMNS.EVENT,
          isSorted: this.state.sortedCol === COLUMNS.EVENT,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(messages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: this.state.sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(messages.sentForReview),
          width: 18,
          key: COLUMNS.SENT_FOR_REVIEW,
          isSorted: this.state.sortedCol === COLUMNS.SENT_FOR_REVIEW,
          sortFunction: this.onColumnClick
        },
        {
          width: 18,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(messages.name),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          label: '',
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    }
  }

  render() {
    const { intl, paginationId, pageSize } = this.props
    const totalPages = Math.ceil(
      this.props.declarationsReadyToSend.length / pageSize
    )

    const isShowPagination =
      this.props.declarationsReadyToSend.length > pageSize

    return (
      <WQContentWrapper
        title={intl.formatMessage(navigationMessages.sentForReview)}
        isMobileSize={this.state.width < this.props.theme.grid.breakpoints.lg}
        isShowPagination={isShowPagination}
        paginationId={paginationId}
        totalPages={totalPages}
        onPageChange={this.props.onPageChange}
        noResultText={intl.formatMessage(constantsMessages.noRecords, {
          tab: 'sent for review'
        })}
        noContent={this.transformDeclarationsReadyToSend().length <= 0}
        loading={false}
        error={false}
      >
        <GridTable
          content={this.transformDeclarationsReadyToSend()}
          columns={this.getColumns()}
          sortedCol={this.state.sortedCol}
          sortOrder={this.state.sortOrder}
          hideLastBorder={!isShowPagination}
        />
      </WQContentWrapper>
    )
  }
}

export const SentForReview = connect(null, {
  deleteDeclaration,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(SentForReviewComponent)))
