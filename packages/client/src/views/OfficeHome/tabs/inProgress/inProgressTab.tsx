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
import { Button } from '@opencrvs/components/lib/buttons'
import {
  ColumnContentAlignment,
  GridTable,
  IAction
} from '@opencrvs/components/lib/interface/GridTable'
import { HomeContent } from '@opencrvs/components/lib/layout'
import {
  GQLHumanName,
  GQLEventSearchResultSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import { IDeclaration, DOWNLOAD_STATUS } from '@client/declarations'
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
import styled, { ITheme, withTheme } from '@client/styledComponents'
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
import { Action } from '@client/forms'
import { get } from 'lodash'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { getDraftInformantFullName } from '@client/utils/draftUtils'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { formattedDuration } from '@client/utils/date-formatting'

const BlueButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.secondary};
  height: 32px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.reg14};
  border-radius: 4px;
  ${({ theme }) => theme.shadows.light};
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }

  &:not([data-focus-visible-added]) {
    outline: none;
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
  }
`
const WhiteButton = styled(Button)`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  height: 32px;
  ${({ theme }) => theme.fonts.reg14};
  ${({ theme }) => theme.shadows.light};
  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }

  &:not([data-focus-visible-added]) {
    outline: none;
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.copy};
  }
`
const TabGroup = styled.div`
  > :first-child {
    border-radius: 4px 0 0 4px;
  }
  > :last-child {
    border-radius: 0 4px 4px 0;
  }
  padding-top: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding-left: 16px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding-top: 5px;
  }
`

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
  pageSize = 10
  constructor(props: IRegistrarHomeProps) {
    super(props)
    this.state = {
      width: window.innerWidth
    }
  }

  transformRemoteDraftsContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }

    const { intl } = this.props
    const { locale } = intl

    return data.results.map((reg, index) => {
      if (!reg) {
        throw new Error('Registration is null')
      }

      const regId = reg.id
      const event = reg.type
      const lastModificationDate =
        (reg && reg.registration && reg.registration.modifiedAt) ||
        (reg && reg.registration && reg.registration.createdAt) ||
        ''
      const trackingId = reg && reg.registration && reg.registration.trackingId
      const pageRoute = REVIEW_EVENT_PARENT_FORM_PAGE
      const eventLocationId = get(reg, 'registration.eventLocationId') || ''
      const facility =
        get(this.props.offlineCountryConfig.facilities, eventLocationId) || {}
      const startedBy = facility.name || ''

      let name
      if (reg.registration && reg.type === 'Birth') {
        const birthReg = reg as GQLBirthEventSearchSet
        const names = birthReg && (birthReg.childName as GQLHumanName[])
        const namesMap = createNamesMap(names)
        name = namesMap[locale] || namesMap[LANG_EN]
      } else {
        const deathReg = reg as GQLDeathEventSearchSet
        const names = deathReg && (deathReg.deceasedName as GQLHumanName[])
        const namesMap = createNamesMap(names)
        name = namesMap[locale] || namesMap[LANG_EN]
      }

      const actions: IAction[] = []
      const foundDeclaration = this.props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus =
        (foundDeclaration && foundDeclaration.downloadStatus) || undefined

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
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

      window.__localeId__ = locale
      return {
        id: regId,
        event:
          (event &&
            intl.formatMessage(
              dynamicConstantsMessages[event.toLowerCase()]
            )) ||
          '',
        name,
        trackingId,
        startedBy,
        dateOfModification:
          (lastModificationDate &&
            formattedDuration(parseInt(lastModificationDate))) ||
          '',
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
  }

  transformDraftContent = () => {
    const { intl } = this.props
    const { locale } = intl
    if (!this.props.drafts || this.props.drafts.length <= 0) {
      return []
    }
    return this.props.drafts.map((draft: IDeclaration) => {
      let pageRoute: string
      if (draft.event && draft.event.toString() === 'birth') {
        pageRoute = DRAFT_BIRTH_PARENT_FORM_PAGE
      } else if (draft.event && draft.event.toString() === 'death') {
        pageRoute = DRAFT_DEATH_FORM_PAGE
      }
      const name = getDraftInformantFullName(draft, locale)
      const lastModificationDate = draft.modifiedOn || draft.savedOn
      const actions = [
        {
          label: this.props.intl.formatMessage(buttonMessages.update),
          handler: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation()
            this.props.goToPage(
              pageRoute,
              draft.id,
              'preview',
              (draft.event && draft.event.toString()) || ''
            )
          }
        }
      ]
      return {
        id: draft.id,
        event:
          (draft.event &&
            intl.formatMessage(
              dynamicConstantsMessages[draft.event.toLowerCase()]
            )) ||
          '',
        name: name || '',
        dateOfModification:
          (lastModificationDate && formattedDuration(lastModificationDate)) ||
          '',
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
  }

  renderInProgressSelectorsWithCounts = (
    selectorId: string,
    drafts: IDeclaration[],
    fieldAgentCount: number,
    hospitalCount: number
  ) => {
    const { intl } = this.props

    return (
      <TabGroup>
        {((!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
          <BlueButton
            id={`selector_${SELECTOR_ID.ownDrafts}`}
            key={SELECTOR_ID.ownDrafts}
            onClick={() =>
              this.props.goToRegistrarHomeTab(
                TAB_ID.inProgress,
                SELECTOR_ID.ownDrafts
              )
            }
          >
            {intl.formatMessage(messages.inProgressOwnDrafts)} (
            {drafts && drafts.length})
          </BlueButton>
        )) || (
          <WhiteButton
            id={`selector_${SELECTOR_ID.ownDrafts}`}
            key={SELECTOR_ID.ownDrafts}
            onClick={() =>
              this.props.goToRegistrarHomeTab(
                TAB_ID.inProgress,
                SELECTOR_ID.ownDrafts
              )
            }
          >
            {intl.formatMessage(messages.inProgressOwnDrafts)} (
            {drafts && drafts.length})
          </WhiteButton>
        )}

        {(selectorId === SELECTOR_ID.fieldAgentDrafts && (
          <BlueButton
            id={`selector_${SELECTOR_ID.fieldAgentDrafts}`}
            key={SELECTOR_ID.fieldAgentDrafts}
            onClick={() =>
              this.props.goToRegistrarHomeTab(
                TAB_ID.inProgress,
                SELECTOR_ID.fieldAgentDrafts
              )
            }
          >
            {intl.formatMessage(messages.inProgressFieldAgents)} (
            {fieldAgentCount})
          </BlueButton>
        )) || (
          <WhiteButton
            id={`selector_${SELECTOR_ID.fieldAgentDrafts}`}
            key={SELECTOR_ID.fieldAgentDrafts}
            onClick={() =>
              this.props.goToRegistrarHomeTab(
                TAB_ID.inProgress,
                SELECTOR_ID.fieldAgentDrafts
              )
            }
          >
            {intl.formatMessage(messages.inProgressFieldAgents)} (
            {fieldAgentCount})
          </WhiteButton>
        )}

        {(selectorId === SELECTOR_ID.hospitalDrafts && (
          <BlueButton
            id={`selector_${SELECTOR_ID.hospitalDrafts}`}
            key={SELECTOR_ID.hospitalDrafts}
            onClick={() =>
              this.props.goToRegistrarHomeTab(
                TAB_ID.inProgress,
                SELECTOR_ID.hospitalDrafts
              )
            }
          >
            {intl.formatMessage(messages.hospitalDrafts)} ({hospitalCount})
          </BlueButton>
        )) || (
          <WhiteButton
            id={`selector_${SELECTOR_ID.hospitalDrafts}`}
            key={SELECTOR_ID.hospitalDrafts}
            onClick={() =>
              this.props.goToRegistrarHomeTab(
                TAB_ID.inProgress,
                SELECTOR_ID.hospitalDrafts
              )
            }
          >
            {intl.formatMessage(messages.hospitalDrafts)} ({hospitalCount})
          </WhiteButton>
        )}
      </TabGroup>
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
          columns={this.getRemoteDraftColumns()}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
          onPageChange={onPageChange}
          pageSize={this.pageSize}
          totalItems={(data && data.totalItems) || 0}
          currentPage={page}
          clickable={true}
          showPaginated={this.props.showPaginated}
          loading={this.props.loading}
          loadMoreText={intl.formatMessage(constantsMessages.loadMore)}
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
          columns={this.getNotificationColumns()}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
          onPageChange={onPageChange}
          pageSize={this.pageSize}
          totalItems={(data && data.totalItems) || 0}
          currentPage={page}
          clickable={true}
          showPaginated={this.props.showPaginated}
          loading={this.props.loading}
          loadMoreText={intl.formatMessage(constantsMessages.loadMore)}
        />
        <LoadingIndicator
          loading={this.props.loading ? true : false}
          hasError={this.props.error ? true : false}
        />
      </>
    )
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

  getDraftColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 15,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 35,
          key: 'name',
          errorValue: this.props.intl.formatMessage(
            constantsMessages.noNameProvided
          )
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.lastEdited),
          width: 35,
          key: 'dateOfModification'
        },
        {
          label: this.props.intl.formatMessage(messages.listItemAction),
          width: 15,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.CENTER
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
          key: 'name',
          errorValue: this.props.intl.formatMessage(
            constantsMessages.noNameProvided
          )
        }
      ]
    }
  }

  getRemoteDraftColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 15,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 30,
          key: 'name',
          errorValue: this.props.intl.formatMessage(
            constantsMessages.noNameProvided
          )
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
          width: 20,
          key: 'dateOfModification'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.trackingId),
          width: 15,
          key: 'trackingId'
        },
        {
          label: this.props.intl.formatMessage(messages.listItemAction),
          width: 20,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.CENTER
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
          key: 'name',
          errorValue: this.props.intl.formatMessage(
            constantsMessages.noNameProvided
          )
        }
      ]
    }
  }

  getNotificationColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 15,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 30,
          key: 'name',
          errorValue: this.props.intl.formatMessage(
            constantsMessages.noNameProvided
          )
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.lastUpdated),
          width: 20,
          key: 'dateOfModification'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.startedBy),
          width: 15,
          key: 'startedBy'
        },
        {
          width: 20,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.CENTER
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
          key: 'name',
          errorValue: this.props.intl.formatMessage(
            constantsMessages.noNameProvided
          )
        }
      ]
    }
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
      <HomeContent>
        {!isFieldAgent &&
          this.renderInProgressSelectorsWithCounts(
            selectorId,
            drafts,
            inProgressData.totalItems || 0,
            notificationData.totalItems || 0
          )}
        {(!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
          <>
            <GridTable
              content={this.transformDraftContent()}
              columns={this.getDraftColumns()}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
              onPageChange={onPageChange}
              pageSize={this.pageSize}
              totalItems={drafts && drafts.length}
              currentPage={page}
              clickable={true}
              showPaginated={this.props.showPaginated}
              loading={this.props.loading}
              loadMoreText={intl.formatMessage(constantsMessages.loadMore)}
            />
            <LoadingIndicator
              loading={this.props.loading ? true : false}
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
      </HomeContent>
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
