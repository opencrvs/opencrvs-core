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
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import {
  DOWNLOAD_STATUS,
  IDeclaration,
  ITaskHistory,
  SUBMISSION_STATUS
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { messages } from '@client/i18n/messages/views/registrarHome'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generateGoToPageUrl
} from '@client/navigation'
import * as routes from '@client/navigation/routes'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { getScope } from '@client/profile/profileSelectors'
import {
  isBirthEvent,
  isDeathEvent,
  isMarriageEvent
} from '@client/search/transformer'
import { IStoreState } from '@client/store'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import {
  formattedDuration,
  isValidPlainDate,
  plainDateToLocalDate
} from '@client/utils/date-formatting'
import { RegStatus } from '@client/utils/gateway'
import type {
  GQLEventSearchResultSet,
  GQLHumanName
} from '@client/utils/gateway-deprecated-do-not-use'
import {
  IconWithName,
  IconWithNameEvent,
  NameContainer,
  NoNameContainer
} from '@client/views/OfficeHome/components'
import {
  changeSortedColumn,
  getPreviousOperationDateByOperationType,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { Scope } from '@opencrvs/commons/client'
import { IAction } from '@opencrvs/components/lib/common-types'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  ColumnContentAlignment,
  COLUMNS,
  SORT_ORDER,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import * as React from 'react'
import { useState } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { withTheme } from 'styled-components'

interface IQueryData {
  inProgressData: GQLEventSearchResultSet
  notificationData: GQLEventSearchResultSet
}

interface IBaseRegistrarHomeProps {
  theme: ITheme
  selectorId: string
  outboxDeclarations: IDeclaration[]
  queryData: IQueryData
  onPageChange: (newPageNumber: number) => void
  paginationId: {
    fieldAgentId: number
    healthSystemId: number
  }
  pageSize: number
  scopes: Scope[] | null
}

interface IProps {
  offlineCountryConfig: IOfflineData
  loading?: boolean
  error?: boolean
}

type IRegistrarHomeProps = IntlShapeProps & IBaseRegistrarHomeProps & IProps

export const SELECTOR_ID = {
  fieldAgentDrafts: 'field-agents',
  hospitalDrafts: 'hospitals'
}

function InProgressComponent(props: IRegistrarHomeProps) {
  const navigate = useNavigate()
  const { width } = useWindowSize()

  const [sortedCol, setSortedCol] = useState<COLUMNS>(COLUMNS.NOTIFICATION_SENT)
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

  const transformRemoteDraftsContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }

    const { intl } = props
    const { locale } = intl

    const items = data.results.map((reg, index) => {
      if (!reg) {
        throw new Error('Registration is null')
      }

      const regId = reg.id
      const event = reg.type
      const lastModificationDate =
        (reg.operationHistories &&
          getPreviousOperationDateByOperationType(
            reg.operationHistories as ITaskHistory[],
            RegStatus.InProgress
          )) ||
        ''
      const pageRoute = REVIEW_EVENT_PARENT_FORM_PAGE

      let name
      let eventDate = ''

      if (reg.registration) {
        if (isBirthEvent(reg)) {
          const names = reg.childName as GQLHumanName[]
          const namesMap = createNamesMap(names)
          name = namesMap[locale] || namesMap[LANG_EN]
          eventDate = reg.dateOfBirth
        } else if (isDeathEvent(reg)) {
          const names = reg.deceasedName as GQLHumanName[]
          const namesMap = createNamesMap(names)
          name = namesMap[locale] || namesMap[LANG_EN]
          const date = reg.dateOfDeath
          eventDate = date && date
        } else if (isMarriageEvent(reg)) {
          const groomNames = reg.groomName as GQLHumanName[]
          const groomNamesMap = createNamesMap(groomNames)
          const brideNames = reg.brideName as GQLHumanName[]
          const brideNamesMap = createNamesMap(brideNames)
          const groomName = groomNamesMap[locale] || groomNamesMap[LANG_EN]
          const brideName = brideNamesMap[locale] || brideNamesMap[LANG_EN]
          name =
            brideName && groomName
              ? `${groomName} & ${brideName}`
              : brideName || groomName || EMPTY_STRING
          const date = reg.dateOfMarriage
          eventDate = date && date
        }
      }

      const dateOfEvent = isValidPlainDate(eventDate)
        ? plainDateToLocalDate(eventDate)
        : ''
      const actions: IAction[] = []
      const foundDeclaration = props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus = foundDeclaration?.downloadStatus

      if (width > props.theme.grid.breakpoints.lg) {
        actions.push({
          label: intl.formatMessage(buttonMessages.update),
          handler: () => {
            if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
              navigate(
                generateGoToPageUrl({
                  pageRoute,
                  declarationId: regId,
                  pageId: 'review',
                  event: (event && event.toLowerCase()) || ''
                })
              )
            }
          },
          disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
        })
      }
      if (reg.registration?.status) {
        actions.push({
          actionComponent: (
            <DownloadButton
              downloadConfigs={{
                event: event as string,
                compositionId: reg.id,
                action: DownloadAction.LOAD_REVIEW_DECLARATION,
                assignment: reg?.registration?.assignment
              }}
              key={`DownloadButton-${index}`}
              status={downloadStatus}
              declarationStatus={reg.registration.status as SUBMISSION_STATUS}
            />
          )
        })
      }

      const NameComponent = name ? (
        <NameContainer
          id={`name_${index}`}
          onClick={() =>
            navigate(
              formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                tab:
                  props.selectorId === SELECTOR_ID.hospitalDrafts
                    ? 'notificationTab'
                    : 'inProgressTab',
                declarationId: regId
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
                tab: 'inProgressTab',
                declarationId: regId
              })
            )
          }
        >
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )

      window.__localeId__ = locale
      return {
        id: regId,
        event:
          (event &&
            intl.formatMessage(
              dynamicConstantsMessages[event.toLowerCase()]
            )) ||
          '',
        name: name && name.toString().toLowerCase(),
        iconWithName: (
          <IconWithName
            status={reg.registration?.status || SUBMISSION_STATUS.DRAFT}
            name={NameComponent}
            isDuplicate={(reg.registration?.duplicates?.length ?? 0) > 0}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.registration?.status || SUBMISSION_STATUS.DRAFT}
            name={NameComponent}
            event={event}
            isDuplicate={(reg.registration?.duplicates?.length ?? 0) > 0}
          />
        ),
        dateOfEvent,
        notificationSent: lastModificationDate || '',
        actions
      }
    })
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)
    return sortedItems.map((item) => {
      return {
        ...item,
        notificationSent:
          item.notificationSent &&
          formattedDuration(item.notificationSent as any),
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date)
      }
    })
  }

  const getColumns = () => {
    if (width > props.theme.grid.breakpoints.lg) {
      return [
        {
          label: props.intl.formatMessage(constantsMessages.name),
          width: 30,
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          isSorted: sortedCol === COLUMNS.EVENT,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.notificationSent),
          width: 18,
          key: COLUMNS.NOTIFICATION_SENT,
          isSorted: sortedCol === COLUMNS.NOTIFICATION_SENT,
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
          label: props.intl.formatMessage(constantsMessages.name),
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

  const getTabs = (
    selectorId: string,
    fieldAgentCount: number,
    hospitalCount: number
  ) => {
    const tabs = {
      activeTabId: selectorId || SELECTOR_ID.fieldAgentDrafts,
      onTabClick: (selectorId: string) => {
        navigate(
          generateGoToHomeTabUrl({
            tabId: WORKQUEUE_TABS.inProgress,
            selectorId
          })
        )
      },
      sections: [
        {
          id: SELECTOR_ID.fieldAgentDrafts,
          title: `${props.intl.formatMessage(
            messages.inProgressFieldAgents
          )} (${fieldAgentCount})`,
          disabled: false
        },
        {
          id: SELECTOR_ID.hospitalDrafts,
          title: `${props.intl.formatMessage(
            messages.hospitalDrafts
          )} (${hospitalCount})`,
          disabled: false
        }
      ]
    }

    return (
      <FormTabs
        sections={tabs.sections}
        activeTabId={tabs.activeTabId}
        onTabClick={(id: string) => tabs.onTabClick(id)}
      />
    )
  }

  const renderFieldAgentTable = (
    data: GQLEventSearchResultSet,
    isShowPagination: boolean
  ) => {
    return (
      <Workqueue
        content={transformRemoteDraftsContent(data)}
        columns={getColumns()}
        loading={props.loading}
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    )
  }

  const renderHospitalTable = (
    data: GQLEventSearchResultSet,
    isShowPagination: boolean
  ) => {
    return (
      <Workqueue
        content={transformRemoteDraftsContent(data)}
        columns={getColumns()}
        loading={props.loading}
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    )
  }

  const { intl, selectorId, queryData, onPageChange } = props

  const isShowPagination =
    !props.selectorId || props.selectorId === SELECTOR_ID.fieldAgentDrafts
      ? props.queryData.inProgressData &&
        props.queryData.inProgressData.totalItems &&
        props.queryData.inProgressData.totalItems > props.pageSize
        ? true
        : false
      : props.queryData.notificationData &&
        props.queryData.notificationData.totalItems &&
        props.queryData.notificationData.totalItems > props.pageSize
      ? true
      : false

  const { inProgressData, notificationData } = queryData
  const paginationId =
    selectorId === SELECTOR_ID.fieldAgentDrafts
      ? props.paginationId.fieldAgentId
      : props.paginationId.healthSystemId

  const totalPages =
    !selectorId || selectorId === SELECTOR_ID.fieldAgentDrafts
      ? props.queryData.inProgressData &&
        props.queryData.inProgressData.totalItems &&
        Math.ceil(props.queryData.inProgressData.totalItems / props.pageSize)
      : props.queryData.notificationData &&
        props.queryData.notificationData.totalItems &&
        Math.ceil(props.queryData.notificationData.totalItems / props.pageSize)

  const noContent =
    !selectorId || selectorId === SELECTOR_ID.fieldAgentDrafts
      ? transformRemoteDraftsContent(inProgressData).length <= 0
      : transformRemoteDraftsContent(notificationData).length <= 0

  const noResultMessage =
    !selectorId || selectorId === SELECTOR_ID.fieldAgentDrafts
      ? intl.formatMessage(wqMessages.noRecordsFieldAgents)
      : intl.formatMessage(wqMessages.noRecordsHealthSystem)

  const tabs = getTabs(
    selectorId,
    (inProgressData && inProgressData.totalItems) || 0,
    (notificationData && notificationData.totalItems) || 0
  )

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.progress)}
      isMobileSize={width < props.theme.grid.breakpoints.lg ? true : false}
      tabBarContent={tabs}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      loading={tabs ? props.loading : false}
      error={props.error}
      noResultText={noResultMessage}
      noContent={noContent}
    >
      {(!selectorId || selectorId === SELECTOR_ID.fieldAgentDrafts) &&
        renderFieldAgentTable(inProgressData, isShowPagination)}
      {selectorId === SELECTOR_ID.hospitalDrafts &&
        renderHospitalTable(notificationData, isShowPagination)}
    </WQContentWrapper>
  )
}

function mapStateToProps(state: IStoreState) {
  return {
    outboxDeclarations: state.declarationsState.declarations,
    offlineCountryConfig: getOfflineData(state),
    scopes: getScope(state)
  }
}

export const InProgress = connect(
  mapStateToProps,
  {}
)(injectIntl(withTheme(InProgressComponent)))
