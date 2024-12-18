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

import {
  Workqueue,
  ColumnContentAlignment,
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/Workqueue'
import type {
  GQLHumanName,
  GQLEventSearchResultSet
} from '@client/utils/gateway-deprecated-do-not-use'
import {
  IDeclaration,
  DOWNLOAD_STATUS,
  SUBMISSION_STATUS,
  ITaskHistory
} from '@client/declarations'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generateGoToPageUrl
} from '@client/navigation'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  DRAFT_MARRIAGE_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { withTheme } from 'styled-components'
import { ITheme } from '@opencrvs/components/lib/theme'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { DownloadAction } from '@client/forms'
import { EventType, RegStatus } from '@client/utils/gateway'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { getDeclarationFullName } from '@client/utils/draftUtils'
import {
  formattedDuration,
  isValidPlainDate,
  plainDateToLocalDate
} from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import { IAction } from '@opencrvs/components/lib/common-types'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import {
  changeSortedColumn,
  getPreviousOperationDateByOperationType,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import {
  isMarriageEvent,
  isBirthEvent,
  isDeathEvent
} from '@client/search/transformer'
import { useState } from 'react'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { useNavigate } from 'react-router-dom'
import * as routes from '@client/navigation/routes'

interface IQueryData {
  inProgressData: GQLEventSearchResultSet
  notificationData: GQLEventSearchResultSet
}

interface IBaseRegistrarHomeProps {
  theme: ITheme
  selectorId: string
  drafts: IDeclaration[]
  outboxDeclarations: IDeclaration[]
  queryData: IQueryData
  isFieldAgent: boolean
  onPageChange: (newPageNumber: number) => void
  paginationId: {
    draftId: number
    fieldAgentId: number
    healthSystemId: number
  }
  pageSize: number
}

interface IProps {
  offlineCountryConfig: IOfflineData
  loading?: boolean
  error?: boolean
}

type IRegistrarHomeProps = IntlShapeProps & IBaseRegistrarHomeProps & IProps

export const SELECTOR_ID = {
  ownDrafts: 'you',
  fieldAgentDrafts: 'field-agents',
  hospitalDrafts: 'hospitals'
}

function InProgressComponent(props: IRegistrarHomeProps) {
  const navigate = useNavigate()
  const { width } = useWindowSize()

  const [sortedCol, setSortedCol] = useState<COLUMNS>(
    props.selectorId && props.selectorId !== SELECTOR_ID.ownDrafts
      ? COLUMNS.NOTIFICATION_SENT
      : COLUMNS.LAST_UPDATED
  )
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
          />
        )
      })

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

  const getDraftsPaginatedData = (drafts: IDeclaration[], pageId: number) => {
    return drafts.slice((pageId - 1) * props.pageSize, pageId * props.pageSize)
  }

  const transformDraftContent = () => {
    const { intl } = props
    const { locale } = intl
    if (!props.drafts || props.drafts.length <= 0) {
      return []
    }
    const paginatedDrafts = getDraftsPaginatedData(
      props.drafts,
      props.paginationId.draftId
    )
    const items = paginatedDrafts.map((draft: IDeclaration, index) => {
      let pageRoute: string
      if (draft.event && draft.event.toString() === 'birth') {
        pageRoute = DRAFT_BIRTH_PARENT_FORM_PAGE
      } else if (draft.event && draft.event.toString() === 'death') {
        pageRoute = DRAFT_DEATH_FORM_PAGE
      } else if (draft.event && draft.event.toString() === 'marriage') {
        pageRoute = DRAFT_MARRIAGE_FORM_PAGE
      }
      const name = getDeclarationFullName(draft, locale)
      const lastModificationDate = draft.modifiedOn || draft.savedOn
      const actions: IAction[] = []

      if (width > props.theme.grid.breakpoints.lg) {
        actions.push({
          label: props.intl.formatMessage(buttonMessages.update),
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
                pageId: 'review',
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
                tab: 'inProgressTab',
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
                tab: 'inProgressTab',
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
          label:
            props.selectorId && props.selectorId !== SELECTOR_ID.ownDrafts
              ? props.intl.formatMessage(constantsMessages.notificationSent)
              : props.intl.formatMessage(constantsMessages.lastUpdated),
          width: 18,
          key:
            props.selectorId && props.selectorId !== SELECTOR_ID.ownDrafts
              ? COLUMNS.NOTIFICATION_SENT
              : COLUMNS.LAST_UPDATED,
          isSorted:
            props.selectorId && props.selectorId !== SELECTOR_ID.ownDrafts
              ? sortedCol === COLUMNS.NOTIFICATION_SENT
              : sortedCol === COLUMNS.LAST_UPDATED,
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
    drafts: IDeclaration[],
    fieldAgentCount: number,
    hospitalCount: number
  ) => {
    if (props.isFieldAgent) {
      return undefined
    }
    const tabs = {
      activeTabId: selectorId || SELECTOR_ID.ownDrafts,
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
          id: SELECTOR_ID.ownDrafts,
          title: `${props.intl.formatMessage(messages.inProgressOwnDrafts)} (${
            drafts && drafts.length
          })`,
          disabled: false
        },
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

  const { intl, selectorId, drafts, queryData, onPageChange, isFieldAgent } =
    props

  const isShowPagination =
    !props.selectorId || props.selectorId === SELECTOR_ID.ownDrafts
      ? props.drafts.length > props.pageSize
        ? true
        : false
      : props.selectorId === SELECTOR_ID.fieldAgentDrafts
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
    !selectorId || selectorId === SELECTOR_ID.ownDrafts
      ? props.paginationId.draftId
      : selectorId === SELECTOR_ID.fieldAgentDrafts
      ? props.paginationId.fieldAgentId
      : props.paginationId.healthSystemId

  const totalPages =
    !selectorId || selectorId === SELECTOR_ID.ownDrafts
      ? Math.ceil(props.drafts.length / props.pageSize)
      : selectorId === SELECTOR_ID.fieldAgentDrafts
      ? props.queryData.inProgressData &&
        props.queryData.inProgressData.totalItems &&
        Math.ceil(props.queryData.inProgressData.totalItems / props.pageSize)
      : props.queryData.notificationData &&
        props.queryData.notificationData.totalItems &&
        Math.ceil(props.queryData.notificationData.totalItems / props.pageSize)

  const noContent =
    !selectorId || selectorId === SELECTOR_ID.ownDrafts
      ? transformDraftContent().length <= 0
      : selectorId === SELECTOR_ID.fieldAgentDrafts
      ? transformRemoteDraftsContent(inProgressData).length <= 0
      : transformRemoteDraftsContent(notificationData).length <= 0

  const noResultMessage =
    !selectorId || selectorId === SELECTOR_ID.ownDrafts
      ? intl.formatMessage(wqMessages.noRecordsDraft)
      : selectorId === SELECTOR_ID.fieldAgentDrafts
      ? intl.formatMessage(wqMessages.noRecordsFieldAgents)
      : intl.formatMessage(wqMessages.noRecordsHealthSystem)

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.progress)}
      isMobileSize={width < props.theme.grid.breakpoints.lg ? true : false}
      tabBarContent={
        !isFieldAgent &&
        getTabs(
          selectorId,
          drafts,
          (inProgressData && inProgressData.totalItems) || 0,
          (notificationData && notificationData.totalItems) || 0
        )
      }
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      loading={isFieldAgent ? false : props.loading}
      error={
        !selectorId || selectorId === SELECTOR_ID.ownDrafts || isFieldAgent
          ? false
          : props.error
      }
      noResultText={noResultMessage}
      noContent={noContent}
    >
      {(!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
        <Workqueue
          content={transformDraftContent()}
          columns={getColumns()}
          loading={isFieldAgent ? false : props.loading}
          sortOrder={sortOrder}
          hideLastBorder={!isShowPagination}
        />
      )}
      {selectorId === SELECTOR_ID.fieldAgentDrafts &&
        !isFieldAgent &&
        renderFieldAgentTable(inProgressData, isShowPagination)}
      {selectorId === SELECTOR_ID.hospitalDrafts &&
        !isFieldAgent &&
        renderHospitalTable(notificationData, isShowPagination)}
    </WQContentWrapper>
  )
}

function mapStateToProps(state: IStoreState) {
  return {
    outboxDeclarations: state.declarationsState.declarations,
    offlineCountryConfig: getOfflineData(state)
  }
}

export const InProgress = connect(
  mapStateToProps,
  {}
)(injectIntl(withTheme(InProgressComponent)))
