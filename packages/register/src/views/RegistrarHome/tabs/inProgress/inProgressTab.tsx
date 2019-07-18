import {
  PrimaryButton,
  SecondaryButton
} from '@opencrvs/components/lib/buttons'
import { Spinner } from '@opencrvs/components/lib/interface'
import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface/GridTable'
import { BodyContent } from '@opencrvs/components/lib/layout'
import {
  GQLBirthRegistration,
  GQLDeathRegistration,
  GQLEventRegistration,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
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
} from '@register/views/RegistrarHome/queries'
import { messages as eventMessages } from '@register/views/SelectVitalEvent/SelectVitalEvent'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { DraftDataDetails } from './draftDataDetails'
import { InProgressDataDetails } from './inProgressDataDetails'

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  hello: {
    id: 'register.registrarHome.header.Hello',
    defaultMessage: 'Hello {fullName}',
    description: 'Title for the user'
  },
  searchInputPlaceholder: {
    id: 'register.registrarHome.searchInput.placeholder',
    defaultMessage: 'Look for a record',
    description: 'The placeholder of search input'
  },
  searchInputButtonTitle: {
    id: 'register.registrarHome.searchButton',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  queryError: {
    id: 'register.registrarHome.queryError',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  },
  dataTableResults: {
    id: 'register.registrarHome.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'register.registrarHome.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  headerTitle: {
    id: 'register.registrarHome.title',
    defaultMessage: 'Hello Registrar',
    description: 'The displayed title in the Work Queue header'
  },
  headerDescription: {
    id: 'register.registrarHome.description',
    defaultMessage: 'Review | Registration | Certification',
    description: 'The displayed description in the Work Queue header'
  },
  inProgress: {
    id: 'register.registrarHome.inProgress',
    defaultMessage: 'In progress',
    description: 'The title of In progress'
  },
  inProgressOwnDrafts: {
    id: 'tab.inProgress.selector.own.drafts',
    defaultMessage: 'Yours',
    description: 'The title of In progress own drafts'
  },
  inProgressFieldAgents: {
    id: 'tab.inProgress.selector.field.agents',
    defaultMessage: 'Field agents',
    description: 'The title of In progress field agents'
  },
  readyForReview: {
    id: 'register.registrarHome.readyForReview',
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review'
  },
  sentForUpdates: {
    id: 'register.registrarHome.sentForUpdates',
    defaultMessage: 'Sent for updates',
    description: 'The title of sent for updates tab'
  },
  listItemType: {
    id: 'register.registrarHome.resultsType',
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item'
  },
  listItemTrackingNumber: {
    id: 'register.registrarHome.results.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in work queue list item'
  },
  listItemApplicantNumber: {
    id: 'register.registrarHome.results.applicantNumber',
    defaultMessage: 'Applicant No.',
    description: 'Label for applicant number in work queue list item'
  },
  listItemApplicationDate: {
    id: 'register.registrarHome.results.applicationDate',
    defaultMessage: 'Application sent',
    description: 'Label for application date in work queue list item'
  },
  listItemUpdateDate: {
    id: 'register.registrarHome.results.updateDate',
    defaultMessage: 'Sent on',
    description: 'Label for rejection date in work queue list item'
  },
  listItemModificationDate: {
    id: 'register.registrarHome.results.modificationDate',
    defaultMessage: 'Last edited',
    description: 'Label for rejection date in work queue list item'
  },
  listItemEventDate: {
    id: 'register.registrarHome.results.eventDate',
    defaultMessage: 'Date of event',
    description: 'Label for event date in work queue list item'
  },
  reviewDuplicates: {
    id: 'register.registrarHome.results.reviewDuplicates',
    defaultMessage: 'Review Duplicates',
    description:
      'The title of review duplicates button in expanded area of list item'
  },
  review: {
    id: 'register.registrarHome.reviewButton',
    defaultMessage: 'Review',
    description: 'The title of review button in list item actions'
  },
  update: {
    id: 'register.registrarHome.updateButton',
    defaultMessage: 'Update',
    description: 'The title of update button in list item actions'
  },
  listItemName: {
    id: 'register.registrarHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemAction: {
    id: 'register.registrarHome.action',
    defaultMessage: 'Action',
    description: 'Label for action in work queue list item'
  },
  readyToPrint: {
    id: 'register.registrarHome.readyToPrint',
    defaultMessage: 'Ready to print',
    description: 'The title of ready to print tab'
  },
  registrationNumber: {
    id: 'register.registrarHome.registrationNumber',
    defaultMessage: 'Registration no.',
    description: 'The heading of registration no. column'
  },
  listItemRegisteredDate: {
    id: 'register.registrarHome.results.registeredDate',
    defaultMessage: 'Application registered',
    description: 'Label for date of registration in work queue list item'
  },
  print: {
    id: 'register.registrarHome.printButton',
    defaultMessage: 'Print',
    description: 'The title of print button in list item actions'
  },
  nameColumnErrorValue: {
    id: 'column.name.error.value',
    defaultMessage: 'No name provided',
    description: 'Text to display if the name column has no value provided'
  }
})

interface IBaseRegistrarHomeProps {
  theme: ITheme
  goToPage: typeof goToPageAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
  selectorId: string
  registrarUnion: string | null
  drafts: IApplication[]
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

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED'
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
            <>
              {((!selectorId || selectorId === SELECTOR_ID.ownDrafts) && (
                <PrimaryButton
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
                </PrimaryButton>
              )) || (
                <SecondaryButton
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
                </SecondaryButton>
              )}

              {(selectorId === SELECTOR_ID.fieldAgentDrafts && (
                <PrimaryButton
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
                </PrimaryButton>
              )) || (
                <SecondaryButton
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
                </SecondaryButton>
              )}
            </>
          )
        }}
      </Query>
    )
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ progressCurrentPage: newPageNumber })
  }

  renderDraftDataExpandedComponent = (itemId: string) => {
    return <DraftDataDetails eventId={itemId} />
  }

  renderInProgressDataExpandedComponent = (itemId: string) => {
    return <InProgressDataDetails eventId={itemId} />
  }

  render() {
    const { theme, intl, registrarUnion, selectorId, drafts } = this.props
    let parentQueryLoading = false

    return (
      <BodyContent>
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
      </BodyContent>
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
