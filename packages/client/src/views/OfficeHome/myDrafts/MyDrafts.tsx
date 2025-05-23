/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { formatUrl, generateGoToPageUrl } from '@client/navigation'
import * as routes from '@client/navigation/routes'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  DRAFT_MARRIAGE_FORM_PAGE
} from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import {
  formattedDuration,
  isValidPlainDate,
  plainDateToLocalDate
} from '@client/utils/date-formatting'
import { getDeclarationFullName } from '@client/utils/draftUtils'
import { EventType } from '@client/utils/gateway'
import {
  IconWithName,
  IconWithNameEvent,
  NameContainer,
  NoNameContainer
} from '@client/views/OfficeHome/components'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { IAction } from '@opencrvs/components/lib/common-types'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
import {
  ColumnContentAlignment,
  COLUMNS,
  SORT_ORDER,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import * as React from 'react'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'styled-components'

export const MyDrafts: React.FC<{
  pageSize: number
  currentPage: number
  onPageChange: (newPageNumber: number) => void
}> = (props) => {
  const navigate = useNavigate()
  const { width } = useWindowSize()
  const intl = useIntl()
  const theme = useTheme()
  const drafts = useSelector((store: IStoreState) =>
    store.declarationsState.declarations.filter(
      ({ submissionStatus }) => submissionStatus === SUBMISSION_STATUS.DRAFT
    )
  )

  const [sortedCol, setSortedCol] = useState<COLUMNS>(COLUMNS.LAST_UPDATED)
  const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.DESCENDING)

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortOrder(newSortOrder)
    setSortedCol(newSortedCol)
  }

  const getDraftsPaginatedData = (drafts: IDeclaration[], pageId: number) => {
    return drafts.slice((pageId - 1) * props.pageSize, pageId * props.pageSize)
  }

  const transformDraftContent = () => {
    if (drafts.length <= 0) {
      return []
    }
    const paginatedDrafts = getDraftsPaginatedData(drafts, props.currentPage)
    const items = paginatedDrafts.map((draft: IDeclaration, index) => {
      let pageRoute: string
      if (draft.event && draft.event.toString() === 'birth') {
        pageRoute = DRAFT_BIRTH_PARENT_FORM_PAGE
      } else if (draft.event && draft.event.toString() === 'death') {
        pageRoute = DRAFT_DEATH_FORM_PAGE
      } else if (draft.event && draft.event.toString() === 'marriage') {
        pageRoute = DRAFT_MARRIAGE_FORM_PAGE
      }
      const name = getDeclarationFullName(draft, intl)
      const lastModificationDate = draft.modifiedOn || draft.savedOn
      const actions: IAction[] = []

      if (width > theme.grid.breakpoints.lg) {
        actions.push({
          label: intl.formatMessage(buttonMessages.update),
          handler: (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
          ) => {
            if (e) {
              e.stopPropagation()
            }

            navigate(
              generateGoToPageUrl({
                pageRoute,
                declarationId: draft.id,
                pageId: 'preview',
                event: (draft.event && draft.event.toString()) || ''
              })
            )
          }
        })
      }
      actions.push({
        actionComponent: <Downloaded />
      })
      const event =
        (draft.event &&
          intl.formatMessage(
            dynamicConstantsMessages[draft.event.toLowerCase()]
          )) ||
        ''

      const eventTime =
        draft.event === EventType.Birth
          ? draft.data.child?.childBirthDate || ''
          : draft.event === EventType.Death
            ? draft.data.deathEvent?.deathDate || ''
            : draft.data.marriageEvent?.marriageDate || ''

      const dateOfEvent = isValidPlainDate(eventTime)
        ? plainDateToLocalDate(eventTime)
        : ''
      const NameComponent = name ? (
        <NameContainer
          id={`name_${index}`}
          onClick={() =>
            navigate(
              formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                tab: 'myDraftsTab',
                declarationId: draft.id
              })
            )
          }
        >
          {name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            navigate(
              formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                tab: 'myDraftsTab',
                declarationId: draft.id
              })
            )
          }
        >
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )
      return {
        id: draft.id,
        event,
        name: (name && name.toString().toLowerCase()) || '',
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
        lastUpdated: lastModificationDate || '',
        dateOfEvent,
        actions
      }
    })
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)

    return sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        lastUpdated:
          item.lastUpdated && formattedDuration(item.lastUpdated as number)
      }
    })
  }

  const getColumns = () => {
    if (width > theme.grid.breakpoints.lg) {
      return [
        {
          label: intl.formatMessage(constantsMessages.name),
          width: 30,
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          isSorted: sortedCol === COLUMNS.EVENT,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.lastUpdated),
          width: 18,
          key: COLUMNS.LAST_UPDATED,
          isSorted: sortedCol === COLUMNS.LAST_UPDATED,
          sortFunction: onColumnClick
        },
        {
          width: 18,
          key: COLUMNS.ACTIONS,
          isActionColumn: true,
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    } else {
      return [
        {
          label: intl.formatMessage(constantsMessages.name),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          width: 30,
          key: COLUMNS.ACTIONS,
          isActionColumn: true,
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    }
  }
  const transformedDraftContent = transformDraftContent()

  const showPagination = drafts.length > props.pageSize ? true : false

  const totalPages = Math.ceil(drafts.length / props.pageSize)

  const noContent = transformedDraftContent.length <= 0

  const noResultMessage = intl.formatMessage(wqMessages.noRecordsDraft)

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages['my-drafts'])}
      isMobileSize={width < theme.grid.breakpoints.lg ? true : false}
      isShowPagination={showPagination}
      paginationId={props.currentPage}
      totalPages={totalPages}
      onPageChange={props.onPageChange}
      noResultText={noResultMessage}
      noContent={noContent}
    >
      <Workqueue
        content={transformedDraftContent}
        columns={getColumns()}
        sortOrder={sortOrder}
        hideLastBorder={!showPagination}
      />
    </WQContentWrapper>
  )
}
