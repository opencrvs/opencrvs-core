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
  goToRegistrarHomeTab as goToRegistrarHomeTabAction,
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
  dynamicConstantsMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { Action, Event } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { getDraftInformantFullName } from '@client/utils/draftUtils'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { formattedDuration } from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { FormTabs } from '@opencrvs/components/lib/forms'
import { officeHomeMessages } from '@client/i18n/messages/views/officeHome'
import { IAction } from '@opencrvs/components/lib/interface/GridTable/types'
import {
  IconWithName,
  IconWithNameEvent
} from '@client/views/OfficeHome/tabs/components'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/tabs/utils'
import { WQContentWrapper } from '@client/views/OfficeHome/tabs/WQContentWrapper'

interface IQueryData {
  inProgressData: GQLEventSearchResultSet
  notificationData: GQLEventSearchResultSet
}

type QueryDataKey = 'inProgressData' | 'notificationData'

interface IBaseRegistrarHomeProps {
  theme: ITheme
  goToPage: typeof goToPageAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  selectorId: string
  drafts: IDeclaration[]
  outboxDeclarations: IDeclaration[]
  queryData: IQueryData
  page: number
  isFieldAgent: boolean
  onPageChange: (newPageNumber: number) => void
}

interface IRegistrarHomeState {
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
}

interface IProps {
  offlineCountryConfig: IOfflineData
  showPaginated?: boolean
  loading?: boolean
  error?: boolean
}

type IRegistrarHomeProps = IntlShapeProps & IBaseRegistrarHomeProps & IProps

export const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  readyForPrint: 'print'
}
export const SELECTOR_ID = {
  ownDrafts: 'you',
  fieldAgentDrafts: 'field-agents',
  hospitalDrafts: 'hospitals'
}

export class InProgressTabComponent extends React.Component<
  IRegistrarHomeProps,
  IRegistrarHomeState
> {
  constructor(props: IRegistrarHomeProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      sortedCol: COLUMNS.NAME,
      sortOrder: SORT_ORDER.ASCENDING
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

  pageSize = 10

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
      const downloadStatus =
        (foundDeclaration && foundDeclaration.downloadStatus) || undefined

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        if (this.state.width > this.props.theme.grid.breakpoints.lg) {
          actions.push({
            label: intl.formatMessage(buttonMessages.update),
            handler: () => {},
            disabled: true
          })
        }
        actions.push({
          actionComponent: (
            <DownloadButton
              downloadConfigs={{
                event: event as string,
                compositionId: reg.id,
                action: Action.LOAD_REVIEW_DECLARATION
              }}
              key={`DownloadButton-${index}`}
              status={downloadStatus as DOWNLOAD_STATUS}
            />
          )
        })
      } else {
        if (this.state.width > this.props.theme.grid.breakpoints.lg) {
          actions.push({
            label: intl.formatMessage(buttonMessages.update),
            handler: () =>
              this.props.goToPage(
                pageRoute,
                regId,
                'review',
                (event && event.toLowerCase()) || ''
              )
          })
        }
        actions.push({
          actionComponent: <Downloaded />
        })
      }

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
            name={name}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.registration?.status || SUBMISSION_STATUS.DRAFT}
            name={name}
            event={event}
          />
        ),
        dateOfEvent,
        notificationSent:
          (lastModificationDate && parseInt(lastModificationDate)) || '',
        actions,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              this.props.goToDeclarationRecordAudit('inProgressTab', regId)
          }
        ]
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

  transformDraftContent = () => {
    const { intl } = this.props
    const { locale } = intl
    if (!this.props.drafts || this.props.drafts.length <= 0) {
      return []
    }
    const items = this.props.drafts.map((draft: IDeclaration) => {
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

      return {
        id: draft.id,
        event,
        name: (name && name.toString().toLowerCase()) || '',
        iconWithName: (
          <IconWithName
            status={
              (draft && draft.submissionStatus) || SUBMISSION_STATUS.DRAFT
            }
            name={name}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={
              (draft && draft.submissionStatus) || SUBMISSION_STATUS.DRAFT
            }
            name={name}
            event={event}
          />
        ),
        lastUpdated: lastModificationDate || '',
        dateOfEvent,
        actions,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              this.props.goToDeclarationRecordAudit('inProgressTab', draft.id)
          }
        ]
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
          label: this.props.intl.formatMessage(constantsMessages.dateOfEvent),
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
          isSorted: this.state.sortedCol === COLUMNS.LAST_UPDATED,
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
        this.props.goToRegistrarHomeTab(TAB_ID.inProgress, tabId)
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
    intl: IntlShape,
    page: number,
    onPageChange: (newPageNumber: number) => void
  ) => {
    return (
      <>
        <GridTable
          content={this.transformRemoteDraftsContent(data)}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(officeHomeMessages.progress)}
          onPageChange={onPageChange}
          clickable={true}
          loading={this.props.loading}
          sortOrder={this.state.sortOrder}
          sortedCol={this.state.sortedCol}
        />
        <LoadingIndicator
          loading={this.props.loading ? true : false}
          hasError={this.props.error ? true : false}
        />
      </>
    )
  }

  renderHospitalTable = (
    data: GQLEventSearchResultSet,
    intl: IntlShape,
    page: number,
    onPageChange: (newPageNumber: number) => void
  ) => {
    return (
      <>
        <GridTable
          content={this.transformRemoteDraftsContent(data)}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(officeHomeMessages.progress)}
          onPageChange={onPageChange}
          clickable={true}
          loading={this.props.loading}
          sortOrder={this.state.sortOrder}
          sortedCol={this.state.sortedCol}
        />
        <LoadingIndicator
          loading={this.props.loading ? true : false}
          hasError={this.props.error ? true : false}
        />
      </>
    )
  }

  render() {
    const {
      intl,
      selectorId,
      drafts,
      queryData,
      page,
      onPageChange,
      isFieldAgent
    } = this.props
    const { inProgressData, notificationData } = queryData
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
      >
        {(!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
          <>
            <GridTable
              content={this.transformDraftContent()}
              columns={this.getColumns()}
              noResultText={intl.formatMessage(officeHomeMessages.progress)}
              onPageChange={onPageChange}
              clickable={true}
              loading={isFieldAgent ? false : this.props.loading}
              sortedCol={this.state.sortedCol}
              sortOrder={this.state.sortOrder}
            />
            <LoadingIndicator
              loading={this.props.loading && !isFieldAgent ? true : false}
              hasError={false}
            />
          </>
        )}
        {selectorId === SELECTOR_ID.fieldAgentDrafts &&
          !isFieldAgent &&
          this.renderFieldAgentTable(inProgressData, intl, page, onPageChange)}
        {selectorId === SELECTOR_ID.hospitalDrafts &&
          !isFieldAgent &&
          this.renderHospitalTable(notificationData, intl, page, onPageChange)}
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

export const InProgressTab = connect(mapStateToProps, {
  goToPage: goToPageAction,
  goToRegistrarHomeTab: goToRegistrarHomeTabAction,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(InProgressTabComponent)))
