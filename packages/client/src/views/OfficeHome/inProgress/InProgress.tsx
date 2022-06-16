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
import { Uploaded } from '@opencrvs/components/lib/icons/Uploaded'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'

import {
  ColumnContentAlignment,
  GridTable,
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/interface/GridTable'
import {
  GQLHumanName,
  GQLEventSearchResultSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import {
  IDeclaration,
  DOWNLOAD_STATUS,
  SUBMISSION_STATUS
} from '@client/declarations'
import {
  goToPage as goToPageAction,
  goToHomeTab,
  goToDeclarationRecordAudit
} from '@client/navigation'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { ITheme, withTheme } from '@client/styledComponents'
import { LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import * as React from 'react'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  IntlShape
} from 'react-intl'
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
import { Action, Event } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { getDraftInformantFullName } from '@client/utils/draftUtils'
import { formattedDuration } from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { FormTabs } from '@opencrvs/components/lib/forms'
import { IAction } from '@opencrvs/components/lib/interface/GridTable/types'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

interface IQueryData {
  inProgressData: GQLEventSearchResultSet
  notificationData: GQLEventSearchResultSet
}

interface IBaseRegistrarHomeProps {
  theme: ITheme
  goToPage: typeof goToPageAction
  goToHomeTab: typeof goToHomeTab
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
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

interface IRegistrarHomeState {
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
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

export class InProgressComponent extends React.Component<
  IRegistrarHomeProps,
  IRegistrarHomeState
> {
  constructor(props: IRegistrarHomeProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      sortedCol:
        this.props.selectorId && this.props.selectorId !== SELECTOR_ID.ownDrafts
          ? COLUMNS.NOTIFICATION_SENT
          : COLUMNS.LAST_UPDATED,
      sortOrder: SORT_ORDER.DESCENDING
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

  transformRemoteDraftsContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }

    const { intl } = this.props
    const { locale } = intl

    const items = data.results.map((reg, index) => {
      if (!reg) {
        throw new Error('Registration is null')
      }

      const regId = reg.id
      const event = reg.type
      const lastModificationDate =
        (reg && reg.registration && reg.registration.modifiedAt) ||
        (reg && reg.registration && reg.registration.createdAt) ||
        ''
      const pageRoute = REVIEW_EVENT_PARENT_FORM_PAGE

      let name
      let eventDate = ''
      if (reg.registration && reg.type === 'Birth') {
        const birthReg = reg as GQLBirthEventSearchSet
        const names = birthReg && (birthReg.childName as GQLHumanName[])
        const namesMap = createNamesMap(names)
        name = namesMap[locale] || namesMap[LANG_EN]
        const date = (reg as GQLBirthEventSearchSet).dateOfBirth
        eventDate = date && date
      } else {
        const deathReg = reg as GQLDeathEventSearchSet
        const names = deathReg && (deathReg.deceasedName as GQLHumanName[])
        const namesMap = createNamesMap(names)
        name = namesMap[locale] || namesMap[LANG_EN]
        const date = (reg as GQLDeathEventSearchSet).dateOfDeath
        eventDate = date && date
      }
      const dateOfEvent =
        eventDate && eventDate.length > 0 ? new Date(eventDate) : ''
      const actions: IAction[] = []
      const foundDeclaration = this.props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus = foundDeclaration?.downloadStatus

      if (this.state.width > this.props.theme.grid.breakpoints.lg) {
        actions.push({
          label: intl.formatMessage(buttonMessages.update),
          handler: () => {
            if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
              this.props.goToPage(
                pageRoute,
                regId,
                'review',
                (event && event.toLowerCase()) || ''
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
              action: Action.LOAD_REVIEW_DECLARATION,
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
          isBoldLink={true}
          onClick={() =>
            this.props.goToDeclarationRecordAudit(
              this.props.selectorId === SELECTOR_ID.hospitalDrafts
                ? 'notificationTab'
                : 'inProgressTab',
              regId
            )
          }
        >
          {name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            this.props.goToDeclarationRecordAudit('inProgressTab', regId)
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
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.registration?.status || SUBMISSION_STATUS.DRAFT}
            name={NameComponent}
            event={event}
          />
        ),
        dateOfEvent,
        notificationSent:
          (lastModificationDate && parseInt(lastModificationDate)) || '',
        actions
      }
    })
    const sortedItems = getSortedItems(
      items,
      this.state.sortedCol,
      this.state.sortOrder
    )
    return sortedItems.map((item) => {
      return {
        ...item,
        notificationSent:
          item.notificationSent &&
          formattedDuration(item.notificationSent as number),
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date)
      }
    })
  }

  getDraftsPaginatedData = (drafts: IDeclaration[], pageId: number) => {
    return drafts.slice(
      (pageId - 1) * this.props.pageSize,
      pageId * this.props.pageSize
    )
  }

  transformDraftContent = () => {
    const { intl } = this.props
    const { locale } = intl
    if (!this.props.drafts || this.props.drafts.length <= 0) {
      return []
    }
    const paginatedDrafts = this.getDraftsPaginatedData(
      this.props.drafts,
      this.props.paginationId.draftId
    )
    const items = paginatedDrafts.map((draft: IDeclaration, index) => {
      let pageRoute: string
      if (draft.event && draft.event.toString() === 'birth') {
        pageRoute = DRAFT_BIRTH_PARENT_FORM_PAGE
      } else if (draft.event && draft.event.toString() === 'death') {
        pageRoute = DRAFT_DEATH_FORM_PAGE
      }
      const name = getDraftInformantFullName(draft, locale)
      const lastModificationDate = draft.modifiedOn || draft.savedOn
      const actions: IAction[] = []

      if (this.state.width > this.props.theme.grid.breakpoints.lg) {
        actions.push({
          label: this.props.intl.formatMessage(buttonMessages.update),
          handler: (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
          ) => {
            e && e.stopPropagation()
            this.props.goToPage(
              pageRoute,
              draft.id,
              'preview',
              (draft.event && draft.event.toString()) || ''
            )
          }
        })
      }
      actions.push({
        actionComponent: <Uploaded />
      })
      const event =
        (draft.event &&
          intl.formatMessage(
            dynamicConstantsMessages[draft.event.toLowerCase()]
          )) ||
        ''
      const eventTime =
        draft.event === Event.BIRTH
          ? draft.data.child?.childBirthDate || ''
          : draft.data.deathEvent?.deathDate || ''
      const dateOfEvent = (eventTime && new Date(eventTime as string)) || ''
      const NameComponent = name ? (
        <NameContainer
          id={`name_${index}`}
          isBoldLink={true}
          onClick={() =>
            this.props.goToDeclarationRecordAudit('inProgressTab', draft.id)
          }
        >
          {name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            this.props.goToDeclarationRecordAudit('inProgressTab', draft.id)
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
    const sortedItems = getSortedItems(
      items,
      this.state.sortedCol,
      this.state.sortOrder
    )

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

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 30,
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: this.state.sortedCol === COLUMNS.NAME,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          isSorted: this.state.sortedCol === COLUMNS.EVENT,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: this.state.sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: this.onColumnClick
        },
        {
          label:
            this.props.selectorId &&
            this.props.selectorId !== SELECTOR_ID.ownDrafts
              ? this.props.intl.formatMessage(
                  constantsMessages.notificationSent
                )
              : this.props.intl.formatMessage(constantsMessages.lastUpdated),
          width: 18,
          key:
            this.props.selectorId &&
            this.props.selectorId !== SELECTOR_ID.ownDrafts
              ? COLUMNS.NOTIFICATION_SENT
              : COLUMNS.LAST_UPDATED,
          isSorted:
            this.props.selectorId &&
            this.props.selectorId !== SELECTOR_ID.ownDrafts
              ? this.state.sortedCol === COLUMNS.NOTIFICATION_SENT
              : this.state.sortedCol === COLUMNS.LAST_UPDATED,
          sortFunction: this.onColumnClick
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
          label: this.props.intl.formatMessage(constantsMessages.name),
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

  getTabs(
    selectorId: string,
    drafts: IDeclaration[],
    fieldAgentCount: number,
    hospitalCount: number
  ) {
    if (this.props.isFieldAgent) {
      return undefined
    }
    const tabs = {
      activeTabId: selectorId || SELECTOR_ID.ownDrafts,
      onTabClick: (tabId: string) => {
        this.props.goToHomeTab(WORKQUEUE_TABS.inProgress, tabId)
      },
      sections: [
        {
          id: SELECTOR_ID.ownDrafts,
          title: `${this.props.intl.formatMessage(
            messages.inProgressOwnDrafts
          )} (${drafts && drafts.length})`,
          disabled: false
        },
        {
          id: SELECTOR_ID.fieldAgentDrafts,
          title: `${this.props.intl.formatMessage(
            messages.inProgressFieldAgents
          )} (${fieldAgentCount})`,
          disabled: false
        },
        {
          id: SELECTOR_ID.hospitalDrafts,
          title: `${this.props.intl.formatMessage(
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

  renderFieldAgentTable = (
    data: GQLEventSearchResultSet,
    isShowPagination: boolean
  ) => {
    return (
      <GridTable
        content={this.transformRemoteDraftsContent(data)}
        columns={this.getColumns()}
        loading={this.props.loading}
        sortOrder={this.state.sortOrder}
        sortedCol={this.state.sortedCol}
        hideLastBorder={!isShowPagination}
      />
    )
  }

  renderHospitalTable = (
    data: GQLEventSearchResultSet,
    isShowPagination: boolean
  ) => {
    return (
      <GridTable
        content={this.transformRemoteDraftsContent(data)}
        columns={this.getColumns()}
        loading={this.props.loading}
        sortOrder={this.state.sortOrder}
        sortedCol={this.state.sortedCol}
        hideLastBorder={!isShowPagination}
      />
    )
  }

  render() {
    const { intl, selectorId, drafts, queryData, onPageChange, isFieldAgent } =
      this.props

    const isShowPagination =
      !this.props.selectorId || this.props.selectorId === SELECTOR_ID.ownDrafts
        ? this.props.drafts.length > this.props.pageSize
          ? true
          : false
        : this.props.selectorId === SELECTOR_ID.fieldAgentDrafts
        ? this.props.queryData.inProgressData.totalItems &&
          this.props.queryData.inProgressData.totalItems > this.props.pageSize
          ? true
          : false
        : this.props.queryData.notificationData.totalItems &&
          this.props.queryData.notificationData.totalItems > this.props.pageSize
        ? true
        : false

    const { inProgressData, notificationData } = queryData
    const paginationId =
      !selectorId || selectorId === SELECTOR_ID.ownDrafts
        ? this.props.paginationId.draftId
        : selectorId === SELECTOR_ID.fieldAgentDrafts
        ? this.props.paginationId.fieldAgentId
        : this.props.paginationId.healthSystemId

    const totalPages =
      !selectorId || selectorId === SELECTOR_ID.ownDrafts
        ? Math.ceil(this.props.drafts.length / this.props.pageSize)
        : selectorId === SELECTOR_ID.fieldAgentDrafts
        ? this.props.queryData.inProgressData.totalItems &&
          Math.ceil(
            this.props.queryData.inProgressData.totalItems / this.props.pageSize
          )
        : this.props.queryData.notificationData.totalItems &&
          Math.ceil(
            this.props.queryData.notificationData.totalItems /
              this.props.pageSize
          )

    const noContent =
      !selectorId || selectorId === SELECTOR_ID.ownDrafts
        ? this.transformDraftContent().length <= 0
        : selectorId === SELECTOR_ID.fieldAgentDrafts
        ? this.transformRemoteDraftsContent(inProgressData).length <= 0
        : this.transformRemoteDraftsContent(notificationData).length <= 0

    const noResultMessage =
      !selectorId || selectorId === SELECTOR_ID.ownDrafts
        ? intl.formatMessage(wqMessages.noRecordsDraft)
        : selectorId === SELECTOR_ID.fieldAgentDrafts
        ? intl.formatMessage(wqMessages.noRecordsFieldAgents)
        : intl.formatMessage(wqMessages.noRecordsHealthSystem)

    return (
      <WQContentWrapper
        title={intl.formatMessage(navigationMessages.progress)}
        isMobileSize={
          this.state.width < this.props.theme.grid.breakpoints.lg ? true : false
        }
        tabBarContent={
          !isFieldAgent &&
          this.getTabs(
            selectorId,
            drafts,
            inProgressData.totalItems || 0,
            notificationData.totalItems || 0
          )
        }
        isShowPagination={isShowPagination}
        paginationId={paginationId}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={isFieldAgent ? false : this.props.loading}
        error={
          !selectorId || selectorId === SELECTOR_ID.ownDrafts || isFieldAgent
            ? false
            : this.props.error
        }
        noResultText={noResultMessage}
        noContent={noContent}
      >
        {(!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
          <GridTable
            content={this.transformDraftContent()}
            columns={this.getColumns()}
            loading={isFieldAgent ? false : this.props.loading}
            sortedCol={this.state.sortedCol}
            sortOrder={this.state.sortOrder}
            hideLastBorder={!isShowPagination}
          />
        )}
        {selectorId === SELECTOR_ID.fieldAgentDrafts &&
          !isFieldAgent &&
          this.renderFieldAgentTable(inProgressData, isShowPagination)}
        {selectorId === SELECTOR_ID.hospitalDrafts &&
          !isFieldAgent &&
          this.renderHospitalTable(notificationData, isShowPagination)}
      </WQContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    outboxDeclarations: state.declarationsState.declarations,
    offlineCountryConfig: getOfflineData(state)
  }
}

export const InProgress = connect(mapStateToProps, {
  goToPage: goToPageAction,
  goToHomeTab: goToHomeTab,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(InProgressComponent)))
