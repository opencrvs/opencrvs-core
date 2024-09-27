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

import React, { useState, useEffect, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from 'styled-components'
import {
  goToDeclarationRecordAudit,
  goToPrintCertificate
} from '@client/navigation'
import { transformData } from '@client/search/transformer'
import {
  ColumnContentAlignment,
  Workqueue,
  SORT_ORDER,
  COLUMNS,
  IAction
} from '@opencrvs/components/lib/Workqueue'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import {
  changeSortedColumn,
  getPreviousOperationDateByOperationType,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import {
  constantsMessages,
  buttonMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import {
  clearCorrectionAndPrintChanges,
  DOWNLOAD_STATUS,
  IDeclaration
} from '@client/declarations'
import {
  formattedDuration,
  plainDateToLocalDate
} from '@client/utils/date-formatting'
import { IStoreState } from '@client/store'
import { Event, SearchEventsQuery } from '@client/utils/gateway'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { DownloadAction } from '@client/forms'
import { isLegacyFormType, useForms } from '@client/hooks/useForms'

type Data = NonNullable<SearchEventsQuery['searchEvents']>
interface IBasePrintTabProps {
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: Data
  }
  paginationId: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
  pageSize: number
}

export const ReadyToPrint: React.FC<IBasePrintTabProps> = ({
  queryData,
  paginationId,
  onPageChange,
  loading,
  error,
  pageSize
}) => {
  const intl = useIntl()
  const theme = useTheme()
  const dispatch = useDispatch()
  const { getRecordSearchLabel, getFormLabel } = useForms()
  const outboxDeclarations = useSelector(
    (state: IStoreState) => state.declarationsState.declarations
  )

  const [width, setWidth] = useState(window.innerWidth)
  const [sortedCol, setSortedCol] = useState(COLUMNS.REGISTERED)
  const [sortOrder, setSortOrder] = useState(SORT_ORDER.DESCENDING)

  const recordWindowWidth = useCallback(() => {
    setWidth(window.innerWidth)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', recordWindowWidth)
    return () => {
      window.removeEventListener('resize', recordWindowWidth)
    }
  }, [recordWindowWidth])

  const getExpandable = () => width > theme.grid.breakpoints.lg

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const getColumns = () => {
    if (width > theme.grid.breakpoints.lg) {
      return [
        {
          width: 30,
          label: intl.formatMessage(constantsMessages.name),
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
          label: intl.formatMessage(constantsMessages.registered),
          width: 18,
          key: COLUMNS.REGISTERED,
          isSorted: sortedCol === COLUMNS.REGISTERED,
          sortFunction: onColumnClick
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
          label: intl.formatMessage(constantsMessages.name),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    }
  }

  const transformLegacyRecord = (
    reg: ReturnType<typeof transformData>[number]
  ) => {
    const foundDeclaration = outboxDeclarations.find(
      (declaration) => declaration.id === reg.id
    )
    const downloadStatus = foundDeclaration?.downloadStatus
    const actions: IAction[] = []

    if (width > theme.grid.breakpoints.lg) {
      actions.push({
        label: intl.formatMessage(buttonMessages.print),
        disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED,
        handler: (e) => {
          e && e.stopPropagation()
          if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
            dispatch(clearCorrectionAndPrintChanges(reg.id))
            dispatch(
              goToPrintCertificate(reg.id, reg.event.toLocaleLowerCase() || '')
            )
          }
        }
      })
    }

    actions.push({
      actionComponent: (
        <DownloadButton
          downloadConfigs={{
            event: reg.event,
            compositionId: reg.id,
            action: DownloadAction.LOAD_REVIEW_DECLARATION,
            assignment: reg.assignment ?? undefined
          }}
          key={`DownloadButton-${reg.id}`}
          status={downloadStatus}
        />
      )
    })

    const event =
      (reg.event &&
        intl.formatMessage(
          dynamicConstantsMessages[reg.event.toLowerCase()]
        )) ||
      ''
    const dateOfEvent = reg.dateOfEvent && plainDateToLocalDate(reg.dateOfEvent)
    const registered =
      getPreviousOperationDateByOperationType(
        reg.operationHistories,
        'Registered'
      ) || ''

    const NameComponent = reg.name ? (
      <NameContainer
        onClick={() => dispatch(goToDeclarationRecordAudit('printTab', reg.id))}
      >
        {reg.name}
      </NameContainer>
    ) : (
      <NoNameContainer
        onClick={() => dispatch(goToDeclarationRecordAudit('printTab', reg.id))}
      >
        {intl.formatMessage(constantsMessages.noNameProvided)}
      </NoNameContainer>
    )

    return {
      ...reg,
      event,
      name: reg.name && reg.name.toLowerCase(),
      iconWithName: (
        <IconWithName status={reg.declarationStatus} name={NameComponent} />
      ),
      iconWithNameEvent: (
        <IconWithNameEvent
          status={reg.declarationStatus}
          name={NameComponent}
          event={event}
        />
      ),
      dateOfEvent,
      registered,
      actions
    }
  }

  const transformRegisteredContent = (data: Data) => {
    if (!data || !data.results) return []

    const legacyEventsData = transformData(
      {
        results: data.results.filter(
          (req) =>
            req?.type && isLegacyFormType(req.type.toLowerCase() as Event)
        )
      },
      intl
    ).map(transformLegacyRecord)

    const eventsData = data.results
      .filter(
        (req) => req?.type && !isLegacyFormType(req.type.toLowerCase() as Event)
      )
      .map((item) => {
        const dateOfEvent = item.registration.createdAt
        const registered =
          getPreviousOperationDateByOperationType(
            item.operationHistories,
            'Registered'
          ) || ''
        const foundDeclaration = outboxDeclarations.find(
          (declaration) => declaration.id === item.id
        )
        const downloadStatus = foundDeclaration?.downloadStatus
        return {
          ...item,
          event: getFormLabel(item.type),
          name: getRecordSearchLabel(item.type, item),
          iconWithName: (
            <IconWithName
              status={item.registration.status}
              name={
                <NameContainer
                  onClick={() =>
                    dispatch(goToDeclarationRecordAudit('printTab', item.id))
                  }
                >
                  {getRecordSearchLabel(item.type, item)}
                </NameContainer>
              }
            />
          ),
          iconWithNameEvent: (
            <IconWithNameEvent
              status={item.registration.status}
              name={
                <NameContainer
                  onClick={() =>
                    dispatch(goToDeclarationRecordAudit('printTab', item.id))
                  }
                >
                  {getRecordSearchLabel(item.type, item)}
                </NameContainer>
              }
              event={getFormLabel(item.type)}
            />
          ),
          actions: [
            {
              actionComponent: (
                <DownloadButton
                  downloadConfigs={{
                    event: item.type,
                    compositionId: item.id,
                    action: DownloadAction.LOAD_REVIEW_DECLARATION,
                    assignment: item.registration.assignment ?? undefined
                  }}
                  key={`DownloadButton-${item.id}`}
                  status={downloadStatus}
                />
              )
            }
          ],
          dateOfEvent,
          registered
        }
      })

    const items = [...legacyEventsData, ...eventsData]
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)

    return sortedItems.map((item) => ({
      ...item,
      dateOfEvent:
        item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
      registered: item.registered && formattedDuration(item.registered as Date)
    }))
  }

  const { data } = queryData
  const totalPages = queryData.data.totalItems
    ? Math.ceil(queryData.data.totalItems / pageSize)
    : 0
  const isShowPagination =
    (queryData.data.totalItems && queryData.data.totalItems > pageSize) || false

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.print)}
      isMobileSize={width < theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      loading={loading}
      error={error}
      noResultText={intl.formatMessage(wqMessages.noRecordsReadyToPrint)}
      noContent={transformRegisteredContent(data).length <= 0}
    >
      <Workqueue
        content={transformRegisteredContent(data)}
        columns={getColumns()}
        loading={loading}
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}
