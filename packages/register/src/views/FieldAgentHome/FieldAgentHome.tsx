import {
  Button,
  FloatingActionButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  PlusTransparentWhite,
  StatusOrange,
  StatusProgress,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  GridTable,
  ISearchInputProps
} from '@opencrvs/components/lib/interface'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import * as moment from 'moment'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import { IApplication, SUBMISSION_STATUS } from 'src/applications'
import { Header } from 'src/components/interface/Header/Header'
import {
  goToEvents as goToEventsAction,
  goToFieldAgentHomeTab as goToFieldAgentHomeTabAction,
  goToTab as goToTabAction,
  goToApplicationDetails
} from 'src/navigation'
import { REGISTRAR_HOME } from 'src/navigation/routes'
import { getUserDetails } from 'src/profile/profileSelectors'
import {
  FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES,
  FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  FIELD_AGENT_ROLE
} from 'src/utils/constants'
import { sentenceCase } from 'src/utils/data-formatting'
import styled from 'styled-components'
import { IUserDetails } from '../../utils/userUtils'
import { SentForReview } from './SentForReview'

const Topbar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 48px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  overflow-x: auto;
  justify-content: flex-start;
  align-items: center;
`
const IconTab = styled(Button).attrs<{ active: boolean }>({})`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
  flex-shrink: 0;
  outline: none;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
  & > div {
    padding: 0 16px;
  }
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & div > div {
    margin-right: 8px;
  }
  &:focus {
    outline: 0;
  }
`
const FABContainer = styled.div`
  position: absolute;
  left: 85.33%;
  right: 5.33%;
  top: 85%;
  bottom: 9.17%;
`
const messages = defineMessages({
  name: {
    id: 'register.registrarHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  dob: {
    id: 'register.registrarHome.listItemDoB',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  dod: {
    id: 'register.registrarHome.listItemDod',
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in work queue list item'
  },
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
  newRegistration: {
    id: 'register.registrarHome.newRegistration',
    defaultMessage: 'New registration',
    description: 'The title of new registration button'
  },
  inProgress: {
    id: 'register.fieldAgentHome.inProgress',
    defaultMessage: 'In progress ({total})',
    description: 'The title of in progress tab'
  },
  sentForReview: {
    id: 'register.fieldAgentHome.sentForReview',
    defaultMessage: 'Sent for review ({total})',
    description: 'The title of sent for review tab'
  },
  requireUpdates: {
    id: 'register.fieldAgentHome.requireUpdates',
    defaultMessage: 'Require updates ({total})',
    description: 'The title of require updates tab'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
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
  }
})
interface IBaseFieldAgentHomeProps {
  language: string
  userDetails: IUserDetails
  tabId: string
  applications: IApplication[]
  goToTab: typeof goToTabAction
  goToEvents: typeof goToEventsAction
  draftCount: string
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  goToApplicationDetails: typeof goToApplicationDetails
  applicationsReadyToSend: IApplication[]
}

interface IMatchParams {
  tabId: string
}

type IFieldAgentHomeProps = IBaseFieldAgentHomeProps &
  InjectedIntlProps &
  ISearchInputProps &
  RouteComponentProps<IMatchParams>

interface IFieldAgentHomeState {
  progressCurrentPage: number
  reviewCurrentPage: number
  updatesCurrentPage: number
}

const TAB_ID = {
  inProgress: FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  sentForReview: FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  requireUpdates: FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES
}

class FieldAgentHomeView extends React.Component<
  IFieldAgentHomeProps,
  IFieldAgentHomeState
> {
  pageSize = 10
  constructor(props: IFieldAgentHomeProps) {
    super(props)
    this.state = {
      progressCurrentPage: 1,
      reviewCurrentPage: 1,
      updatesCurrentPage: 1
    }
  }

  getDraftsCount() {
    const { applications } = this.props
    let draftsCount = 0
    if (applications) {
      applications.forEach(application => {
        if (
          application.submissionStatus ===
          SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        ) {
          draftsCount++
        }
      })
    }

    return draftsCount
  }

  transformDraftContent = () => {
    if (!this.props.applications || this.props.applications.length <= 0) {
      return []
    }
    const drafts = this.props.applications.filter(
      application =>
        application.submissionStatus ===
        SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    )
    return drafts.map((draft: IApplication) => {
      let name
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
      }
      const lastModificationDate = draft.modifiedOn || draft.savedOn

      return {
        id: draft.id,
        event: (draft.event && sentenceCase(draft.event)) || '',
        name: name || '',
        date_of_modification:
          `Last updated ${lastModificationDate &&
            moment(lastModificationDate).fromNow()}` || '',
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () => this.props.goToApplicationDetails(draft.id)
          }
        ]
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    if (this.props.tabId === TAB_ID.inProgress) {
      this.setState({ progressCurrentPage: newPageNumber })
    }
  }

  render() {
    const {
      applications,
      userDetails,
      match,
      intl,
      applicationsReadyToSend
    } = this.props
    const tabId = match.params.tabId || TAB_ID.inProgress
    const isFieldAgent =
      userDetails && userDetails.name && userDetails.role === FIELD_AGENT_ROLE
    return (
      <>
        {isFieldAgent && (
          <>
            <Header />
            <Topbar id="top-bar">
              <IconTab
                id={`tab_${TAB_ID.inProgress}`}
                key={TAB_ID.inProgress}
                active={tabId === TAB_ID.inProgress}
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <StatusProgress />}
                onClick={() =>
                  this.props.goToFieldAgentHomeTab(TAB_ID.inProgress)
                }
              >
                {intl.formatMessage(messages.inProgress, {
                  total: this.getDraftsCount()
                })}
              </IconTab>
              <IconTab
                id={`tab_${TAB_ID.sentForReview}`}
                key={TAB_ID.sentForReview}
                active={tabId === TAB_ID.sentForReview}
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <StatusOrange />}
                onClick={() =>
                  this.props.goToFieldAgentHomeTab(TAB_ID.sentForReview)
                }
              >
                {intl.formatMessage(messages.sentForReview, {
                  total: applicationsReadyToSend.length
                })}
              </IconTab>
              <IconTab
                id={`tab_${TAB_ID.requireUpdates}`}
                key={TAB_ID.requireUpdates}
                active={tabId === TAB_ID.requireUpdates}
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <StatusRejected />}
                onClick={() =>
                  this.props.goToFieldAgentHomeTab(TAB_ID.requireUpdates)
                }
              >
                {intl.formatMessage(messages.requireUpdates, {
                  total: 1
                })}
              </IconTab>
            </Topbar>
            {tabId === TAB_ID.sentForReview && (
              <SentForReview
                applicationsReadyToSend={applicationsReadyToSend}
              />
            )}
            <FABContainer>
              <FloatingActionButton
                id="new_event_declaration"
                onClick={this.props.goToEvents}
                icon={() => <PlusTransparentWhite />}
              />
            </FABContainer>

            {tabId === TAB_ID.inProgress && (
              <GridTable
                content={this.transformDraftContent()}
                columns={[
                  {
                    label: this.props.intl.formatMessage(messages.listItemType),
                    width: 20,
                    key: 'event'
                  },
                  {
                    label: this.props.intl.formatMessage(messages.listItemName),
                    width: 40,
                    key: 'name',
                    errorValue: 'No name provided'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemModificationDate
                    ),
                    width: 40,
                    key: 'date_of_modification'
                  }
                ]}
                noResultText={intl.formatMessage(messages.dataTableNoResults)}
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalPages={applications && applications.length}
                initialPage={this.state.progressCurrentPage}
                expandable={false}
                clickable={true}
              />
            )}
          </>
        )}
        {userDetails && userDetails.role && !isFieldAgent && (
          <Redirect to={REGISTRAR_HOME} />
        )}
      </>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string }>
) => {
  const { match } = props
  return {
    language: getLanguage(state),
    userDetails: getUserDetails(state),
    tabId: (match && match.params && match.params.tabId) || 'progress',
    applications: state.applicationsState.applications,
    applicationsReadyToSend:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus !==
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
  }
}

export const FieldAgentHome = connect(
  mapStateToProps,
  {
    goToTab: goToTabAction,
    goToEvents: goToEventsAction,
    goToFieldAgentHomeTab: goToFieldAgentHomeTabAction,
    goToApplicationDetails
  }
)(injectIntl(FieldAgentHomeView))
