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
import { IApplication, DOWNLOAD_STATUS } from '@register/applications'
import {
  goToPage as goToPageAction,
  goToRegistrarHomeTab as goToRegistrarHomeTabAction,
  goToApplicationDetails
} from '@register/navigation'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@register/navigation/routes'
import styled, { ITheme, withTheme } from '@register/styledComponents'
import { LANG_EN } from '@register/utils/constants'
import { createNamesMap, sentenceCase } from '@register/utils/data-formatting'
import moment from 'moment'
import * as React from 'react'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  IntlShape
} from 'react-intl'
import { connect } from 'react-redux'
import { LocalInProgressDataDetails } from './localInProgressDataDetails'
import { RemoteInProgressDataDetails } from './remoteInProgressDataDetails'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages
} from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/registrarHome'
import { Download } from '@opencrvs/components/lib/icons'

const BlueButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.secondary};
  height: 32px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.smallButtonStyle};
  border-radius: 4px;
  ${({ theme }) => theme.shadows.mistyShadow};
`
const WhiteButton = styled(Button)`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  height: 32px;
  ${({ theme }) => theme.fonts.smallButtonStyle};
  ${({ theme }) => theme.shadows.mistyShadow};
  &:hover {
    background: ${({ theme }) => theme.colors.dropdownHover};
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
  data: GQLEventSearchResultSet
}

interface IBaseRegistrarHomeProps {
  theme: ITheme
  goToPage: typeof goToPageAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
  goToApplicationDetails: typeof goToApplicationDetails
  selectorId: string
  registrarLocationId: string | null
  drafts: IApplication[]
  queryData: IQueryData
  page: number
  onPageChange: (newPageNumber: number) => void
}

interface IRegistrarHomeState {
  width: number
}

type IRegistrarHomeProps = IntlShapeProps & IBaseRegistrarHomeProps

export const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  readyForPrint: 'print'
}
export const SELECTOR_ID = {
  ownDrafts: 'you',
  fieldAgentDrafts: 'field-agents'
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

    return data.results.map(reg => {
      if (!reg) {
        throw new Error('Registration is null')
      }

      const regId = reg.id
      const event = reg.type
      const lastModificationDate =
        (reg && reg.registration && reg.registration.modifiedAt) || ''
      const trackingId = reg && reg.registration && reg.registration.trackingId
      const pageRoute = REVIEW_EVENT_PARENT_FORM_PAGE

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
      const foundApplication = this.props.drafts.find(
        application => application.id === reg.id
      )
      const downloadStatus =
        (foundApplication && foundApplication.downloadStatus) || undefined

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        actions.push({
          label: '',
          icon: () => <Download />,
          handler: () => {
            console.log('To dispatch download action')
          },
          loading: downloadStatus === DOWNLOAD_STATUS.DOWNLOADING,
          error: downloadStatus === DOWNLOAD_STATUS.FAILED,
          loadingLabel: this.props.intl.formatMessage(
            constantsMessages.downloading
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

      moment.locale(locale)
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
        dateOfModification:
          (lastModificationDate && moment(lastModificationDate).fromNow()) ||
          '',
        actions,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () => this.props.goToApplicationDetails(regId)
          }
        ]
      }
    })
  }

  transformDraftContent = () => {
    if (!this.props.drafts || this.props.drafts.length <= 0) {
      return []
    }
    return this.props.drafts.map((draft: IApplication) => {
      let name
      let pageRoute: string
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
        pageRoute = DRAFT_BIRTH_PARENT_FORM_PAGE
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
        pageRoute = DRAFT_DEATH_FORM_PAGE
      }
      const lastModificationDate = draft.modifiedOn || draft.savedOn
      const actions = [
        {
          label: this.props.intl.formatMessage(buttonMessages.update),
          handler: () =>
            this.props.goToPage(
              pageRoute,
              draft.id,
              'preview',
              (draft.event && draft.event.toString()) || ''
            )
        }
      ]
      return {
        id: draft.id,
        event: (draft.event && sentenceCase(draft.event)) || '',
        name: name || '',
        dateOfModification:
          (lastModificationDate && moment(lastModificationDate).fromNow()) ||
          '',
        actions,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () => this.props.goToApplicationDetails(draft.id)
          }
        ]
      }
    })
  }

  renderInProgressSelectorsWithCounts = (
    selectorId: string,
    drafts: IApplication[],
    count: number
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
            {intl.formatMessage(messages.inProgressFieldAgents)} ({count})
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
            {intl.formatMessage(messages.inProgressFieldAgents)} ({count})
          </WhiteButton>
        )}
      </TabGroup>
    )
  }

  renderDraftDataExpandedComponent = (itemId: string) => {
    return <LocalInProgressDataDetails eventId={itemId} />
  }

  renderInProgressDataExpandedComponent = (itemId: string) => {
    return <RemoteInProgressDataDetails eventId={itemId} />
  }

  renderFieldAgentTable = (
    data: GQLEventSearchResultSet,
    intl: IntlShape,
    page: number,
    onPageChange: (newPageNumber: number) => void
  ) => {
    return (
      <GridTable
        content={this.transformRemoteDraftsContent(data)}
        columns={this.getRemoteDraftColumns()}
        renderExpandedComponent={this.renderInProgressDataExpandedComponent}
        noResultText={intl.formatMessage(constantsMessages.noResults)}
        onPageChange={onPageChange}
        pageSize={this.pageSize}
        totalItems={(data && data.totalItems) || 0}
        currentPage={page}
        expandable={this.getExpandable()}
        clickable={!this.getExpandable()}
      />
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

  getExpandable = () => {
    return this.state.width > this.props.theme.grid.breakpoints.lg
      ? true
      : false
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
      onPageChange
    } = this.props
    const { data } = queryData

    return (
      <HomeContent>
        {this.renderInProgressSelectorsWithCounts(
          selectorId,
          drafts,
          data.totalItems || 0
        )}
        {(!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
          <GridTable
            content={this.transformDraftContent()}
            columns={this.getDraftColumns()}
            renderExpandedComponent={this.renderDraftDataExpandedComponent}
            noResultText={intl.formatMessage(constantsMessages.noResults)}
            onPageChange={onPageChange}
            pageSize={this.pageSize}
            totalItems={drafts && drafts.length}
            currentPage={page}
            expandable={this.getExpandable()}
            clickable={!this.getExpandable()}
          />
        )}
        {selectorId === SELECTOR_ID.fieldAgentDrafts &&
          this.renderFieldAgentTable(data, intl, page, onPageChange)}
      </HomeContent>
    )
  }
}

export const InProgressTab = connect(
  null,
  {
    goToPage: goToPageAction,
    goToRegistrarHomeTab: goToRegistrarHomeTabAction,
    goToApplicationDetails
  }
)(injectIntl(withTheme(InProgressTabComponent)))
