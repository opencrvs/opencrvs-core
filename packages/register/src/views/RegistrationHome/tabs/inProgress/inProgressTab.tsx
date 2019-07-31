import { Button } from '@opencrvs/components/lib/buttons'
import { Spinner } from '@opencrvs/components/lib/interface'
import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface/GridTable'
import { BodyWrapper } from '@opencrvs/components/lib/layout'
import {
  GQLBirthRegistration,
  GQLDeathRegistration,
  GQLEventRegistration,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema'
import { IApplication } from '@register/applications'
import {
  goToPage as goToPageAction,
  goToRegistrarHomeTab as goToRegistrarHomeTabAction
} from '@register/navigation'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@register/navigation/routes'
import styled, { ITheme, withTheme } from '@register/styledComponents'
import { LANG_EN } from '@register/utils/constants'
import { createNamesMap, sentenceCase } from '@register/utils/data-formatting'
import {
  COUNT_EVENT_REGISTRATION_BY_STATUS,
  LIST_EVENT_REGISTRATIONS_BY_STATUS
} from '@register/views/RegistrationHome/queries'
import { messages as eventMessages } from '@register/views/SelectVitalEvent/SelectVitalEvent'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { messages } from '@register/views/RegistrationHome/messages'
import { LocalInProgressDataDetails } from './localInProgressDataDetails'
import { RemoteInProgressDataDetails } from './remoteInProgressDataDetails'
import { EVENT_STATUS } from '@register/views/RegistrationHome/RegistrationHome'

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
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
  padding-top: 16px;
`
interface IBaseRegistrarHomeProps {
  theme: ITheme
  goToPage: typeof goToPageAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
  selectorId: string
  registrarUnion: string | null
  drafts: IApplication[]
  parentQueryLoading?: boolean
}

interface IRegistrarHomeState {
  progressCurrentPage: number
}

type IRegistrarHomeProps = InjectedIntlProps & IBaseRegistrarHomeProps

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
      progressCurrentPage: 1
    }
  }

  transformRemoteDraftsContent = (data: GQLQuery) => {
    if (!data.listEventRegistrations || !data.listEventRegistrations.results) {
      return []
    }

    const { intl } = this.props
    const { locale } = intl

    return data.listEventRegistrations.results.map(
      (reg: GQLEventRegistration | null) => {
        let birthReg
        let deathReg
        let name

        const regId = (reg as GQLEventRegistration).id
        const event =
          reg && reg.registration && (reg.registration.type as string)
        const lastModificationDate = reg && reg.createdAt
        const trackingId =
          reg && reg.registration && reg.registration.trackingId
        const pageRoute = REVIEW_EVENT_PARENT_FORM_PAGE

        if (event && event.toLowerCase() === 'birth') {
          birthReg = reg as GQLBirthRegistration
          const childName =
            (birthReg.child && (birthReg.child.name as GQLHumanName[])) || []
          name =
            (createNamesMap(childName)[locale] as string) ||
            (createNamesMap(childName)[LANG_EN] as string) ||
            ''
        } else if (event && event.toLowerCase() === 'death') {
          deathReg = reg as GQLDeathRegistration
          const deceasedName =
            (deathReg.deceased && (deathReg.deceased.name as GQLHumanName[])) ||
            []
          name =
            (createNamesMap(deceasedName)[locale] as string) ||
            (createNamesMap(deceasedName)['default'] as string) ||
            ''
        }
        const actions = [
          {
            label: intl.formatMessage(messages.update),
            handler: () =>
              this.props.goToPage(
                pageRoute,
                regId,
                'review',
                (event && event.toLowerCase()) || ''
              )
          }
        ]
        moment.locale(locale)
        return {
          id: regId,
          event:
            (event && intl.formatMessage(eventMessages[event.toLowerCase()])) ||
            '',
          name,
          trackingId,
          dateOfModification:
            (lastModificationDate && moment(lastModificationDate).fromNow()) ||
            '',
          actions
        }
      }
    )
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
          label: this.props.intl.formatMessage(messages.update),
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
        actions
      }
    })
  }

  renderInProgressSelectorsWithCounts = (
    selectorId: string,
    drafts: IApplication[],
    registrarUnion: string
  ) => {
    const { intl } = this.props

    return (
      <Query
        query={COUNT_EVENT_REGISTRATION_BY_STATUS}
        variables={{
          locationIds: [registrarUnion],
          status: EVENT_STATUS.IN_PROGRESS
        }}
      >
        {({
          loading,
          error,
          data
        }: {
          loading: any
          error?: any
          data: any
        }) => {
          if (error) {
            Sentry.captureException(error)
            return (
              <ErrorText id="search-result-error-text-count">
                {intl.formatMessage(messages.queryError)}
              </ErrorText>
            )
          }
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
                  {(data &&
                    data.countEventRegistrationsByStatus &&
                    data.countEventRegistrationsByStatus.count) ||
                    0}
                  )
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
                  {(data &&
                    data.countEventRegistrationsByStatus &&
                    data.countEventRegistrationsByStatus.count) ||
                    0}
                  )
                </WhiteButton>
              )}
            </TabGroup>
          )
        }}
      </Query>
    )
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ progressCurrentPage: newPageNumber })
  }

  renderDraftDataExpandedComponent = (itemId: string) => {
    return <LocalInProgressDataDetails eventId={itemId} />
  }

  renderInProgressDataExpandedComponent = (itemId: string) => {
    return <RemoteInProgressDataDetails eventId={itemId} />
  }

  render() {
    const {
      theme,
      intl,
      registrarUnion,
      selectorId,
      drafts,
      parentQueryLoading
    } = this.props

    return (
      <BodyWrapper>
        {this.renderInProgressSelectorsWithCounts(
          selectorId,
          drafts,
          registrarUnion as string
        )}
        {(!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
          <GridTable
            content={this.transformDraftContent()}
            columns={[
              {
                label: intl.formatMessage(messages.listItemType),
                width: 15,
                key: 'event'
              },
              {
                label: intl.formatMessage(messages.listItemName),
                width: 35,
                key: 'name',
                errorValue: intl.formatMessage(messages.nameColumnErrorValue)
              },
              {
                label: intl.formatMessage(messages.listItemModificationDate),
                width: 35,
                key: 'dateOfModification'
              },
              {
                label: intl.formatMessage(messages.listItemAction),
                width: 15,
                key: 'actions',
                isActionColumn: true,
                alignment: ColumnContentAlignment.CENTER
              }
            ]}
            renderExpandedComponent={this.renderDraftDataExpandedComponent}
            noResultText={intl.formatMessage(messages.dataTableNoResults)}
            onPageChange={(currentPage: number) => {
              this.onPageChange(currentPage)
            }}
            pageSize={this.pageSize}
            totalItems={drafts && drafts.length}
            currentPage={this.state.progressCurrentPage}
            expandable={true}
          />
        )}
        {selectorId === SELECTOR_ID.fieldAgentDrafts && (
          <Query
            query={LIST_EVENT_REGISTRATIONS_BY_STATUS}
            variables={{
              status: EVENT_STATUS.IN_PROGRESS,
              locationIds: [registrarUnion],
              count: this.pageSize,
              skip: (this.state.progressCurrentPage - 1) * this.pageSize
            }}
          >
            {({
              loading,
              error,
              data
            }: {
              loading: any
              error?: any
              data: any
            }) => {
              if (loading) {
                return (
                  (!parentQueryLoading && (
                    <StyledSpinner
                      id="remote-drafts-spinner"
                      baseColor={theme.colors.background}
                    />
                  )) ||
                  null
                )
              }
              if (error) {
                Sentry.captureException(error)
                return (
                  <ErrorText id="remote-drafts-error-text">
                    {intl.formatMessage(messages.queryError)}
                  </ErrorText>
                )
              }
              return (
                <GridTable
                  content={this.transformRemoteDraftsContent(data)}
                  columns={[
                    {
                      label: intl.formatMessage(messages.listItemType),
                      width: 15,
                      key: 'event'
                    },
                    {
                      label: intl.formatMessage(messages.listItemName),
                      width: 30,
                      key: 'name',
                      errorValue: intl.formatMessage(
                        messages.nameColumnErrorValue
                      )
                    },
                    {
                      label: intl.formatMessage(
                        messages.listItemModificationDate
                      ),
                      width: 20,
                      key: 'dateOfModification'
                    },
                    {
                      label: intl.formatMessage(
                        messages.listItemTrackingNumber
                      ),
                      width: 15,
                      key: 'trackingId'
                    },
                    {
                      width: 20,
                      key: 'actions',
                      isActionColumn: true,
                      alignment: ColumnContentAlignment.CENTER
                    }
                  ]}
                  renderExpandedComponent={
                    this.renderInProgressDataExpandedComponent
                  }
                  noResultText={intl.formatMessage(messages.dataTableNoResults)}
                  onPageChange={(currentPage: number) => {
                    this.onPageChange(currentPage)
                  }}
                  pageSize={this.pageSize}
                  totalItems={
                    data.listEventRegistrations &&
                    data.listEventRegistrations.totalItems
                  }
                  currentPage={this.state.progressCurrentPage}
                  expandable={true}
                />
              )
            }}
          </Query>
        )}
      </BodyWrapper>
    )
  }
}

export const InProgressTab = connect(
  null,
  {
    goToPage: goToPageAction,
    goToRegistrarHomeTab: goToRegistrarHomeTabAction
  }
)(injectIntl(withTheme(InProgressTabComponent)))
