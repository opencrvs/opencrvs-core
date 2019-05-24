import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { RouteComponentProps, Redirect } from 'react-router'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { goToEvents as goToEventsAction } from 'src/navigation'
import {
  ISearchInputProps,
  GridTable,
  Spinner,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import { IUserDetails } from '../../utils/userUtils'
import { getUserDetails } from 'src/profile/profileSelectors'
import { Header } from 'src/components/interface/Header/Header'
import {
  FIELD_AGENT_ROLE,
  FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES
} from 'src/utils/constants'
import styled from 'styled-components'
import {
  Button,
  ICON_ALIGNMENT,
  FloatingActionButton
} from '@opencrvs/components/lib/buttons'
import {
  StatusProgress,
  StatusOrange,
  StatusRejected,
  PlusTransparentWhite,
  StatusWaiting,
  StatusSubmitted,
  StatusPendingOffline,
  StatusFailed
} from '@opencrvs/components/lib/icons'
import { goToFieldAgentHomeTab as goToFieldAgentHomeTabAction } from '../../navigation'
import { REGISTRAR_HOME } from 'src/navigation/routes'
import {
  IApplication,
  SUBMISSION_STATUS,
  deleteApplication
} from 'src/applications'
import { sentenceCase } from 'src/utils/data-formatting'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { calculateDays } from '../PrintCertificate/calculatePrice'

const APPLICATIONS_DAY_LIMIT = 7

const Topbar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 48px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const IconTab = styled(Button).attrs<{ active: boolean }>({})`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
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

// Might add a size prop to our Spinner lib component
const SmallSpinner = styled(Spinner)`
  width: 24px;
  height: 24px;
`
const messages = defineMessages({
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
  dataTableNoResults: {
    id: 'register.registrarHome.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  listItemType: {
    id: 'register.registrarHome.resultsType',
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item'
  },
  name: {
    id: 'register.registrarHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  submissionStatus: {
    id: 'register.fieldAgentHome.tableHeader.submissionStatus',
    defaultMessage: 'Submission status',
    description: 'Label for table header of column Submission status'
  },
  statusReadyToSubmit: {
    id: 'register.fieldAgentHome.table.statusReadyToSubmit',
    defaultMessage: 'Waiting to send',
    description: 'Label for application status Ready to Submit'
  },
  statusSubmitting: {
    id: 'register.fieldAgentHome.table.statusSubmitting',
    defaultMessage: 'Sending...',
    description: 'Label for application status Submitting'
  },
  statusFailed: {
    id: 'register.fieldAgentHome.table.statusFailed',
    defaultMessage: 'Failed to send',
    description: 'Label for application status Failed'
  },
  statusPendingConnection: {
    id: 'register.fieldAgentHome.table.statusPendingConnection',
    defaultMessage: 'Pending connection',
    description: 'Label for application status Pending Connection'
  }
})
interface IFieldAgentHomeProps {
  language: string
  userDetails: IUserDetails
  goToEvents: typeof goToEventsAction
  draftCount: string
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  deleteApplication: typeof deleteApplication
  applications: IApplication[]
}

interface IMatchParams {
  tabId: string
}

type FullProps = IFieldAgentHomeProps &
  InjectedIntlProps &
  ISearchInputProps &
  RouteComponentProps<IMatchParams>

const TAB_ID = {
  inProgress: FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  sentForReview: FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  requireUpdates: FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES
}
class FieldAgentHomeView extends React.Component<FullProps> {
  transformApplicationsSentForReview = () => {
    if (!this.props.applications || this.props.applications.length <= 0) {
      return []
    }
    return this.props.applications
      .filter(
        (application: IApplication) =>
          application.submissionStatus !==
          SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      )
      .map((draft: IApplication, index) => {
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

        const { statusText, icon } = this.submissionStatusMap(
          draft.submissionStatus || '',
          navigator.onLine,
          index,
          'DC5EDNG'
        )

        return {
          id: draft.id,
          event: (draft.event && sentenceCase(draft.event)) || '',
          name: name || '',
          submission_status: statusText || '',
          status_indicator: icon ? [icon()] : null
        }
      })
  }

  submissionStatusMap = (
    status: string,
    online: boolean,
    index: number,
    id?: string
  ) => {
    const { formatMessage } = this.props.intl
    const {
      statusReadyToSubmit,
      statusSubmitting,
      statusFailed,
      statusPendingConnection
    } = messages

    let icon: () => React.ReactNode
    let statusText: string
    let overwriteStatusIfOffline: boolean = true

    switch (status) {
      case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTING]:
        icon = () => <SmallSpinner id={`submitting${index}`} />
        statusText = formatMessage(statusSubmitting)
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]:
        overwriteStatusIfOffline = false
        icon = () => <StatusSubmitted />
        statusText = id || ''
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]:
        overwriteStatusIfOffline = false
        icon = () => <StatusFailed />
        statusText = formatMessage(statusFailed)
        break
      case SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_SUBMIT]:
      default:
        icon = () => <StatusWaiting />
        statusText = formatMessage(statusReadyToSubmit)
        break
    }

    if (!online && overwriteStatusIfOffline) {
      icon = () => <StatusPendingOffline />
      statusText = formatMessage(statusPendingConnection)
    }

    return {
      icon,
      statusText
    }
  }

  componentDidMount() {
    this.props.applications
      .filter(
        (application: IApplication) =>
          application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED] &&
          application.modifiedOn &&
          calculateDays(
            new Date(application.modifiedOn).toISOString().split('T')[0]
          ) > APPLICATIONS_DAY_LIMIT
      )
      .forEach(this.props.deleteApplication)
  }

  render() {
    const { userDetails, match, intl } = this.props
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
                  total: 1
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
                  total: 1
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
              <BodyContent>
                <GridTable
                  content={this.transformApplicationsSentForReview()}
                  columns={[
                    {
                      label: this.props.intl.formatMessage(
                        messages.listItemType
                      ),
                      width: 15,
                      key: 'event'
                    },
                    {
                      width: 35,
                      label: this.props.intl.formatMessage(messages.name),
                      key: 'name'
                    },
                    {
                      label: this.props.intl.formatMessage(
                        messages.submissionStatus
                      ),
                      width: 47,
                      key: 'submission_status'
                    },
                    {
                      label: '',
                      width: 3,
                      alignment: ColumnContentAlignment.CENTER,
                      key: 'status_indicator'
                    }
                  ]}
                  noResultText={intl.formatMessage(messages.dataTableNoResults)}
                />
              </BodyContent>
            )}
            <FABContainer>
              <FloatingActionButton
                id="new_event_declaration"
                onClick={this.props.goToEvents}
                icon={() => <PlusTransparentWhite />}
              />
            </FABContainer>
          </>
        )}
        {userDetails && userDetails.role && !isFieldAgent && (
          <Redirect to={REGISTRAR_HOME} />
        )}
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    userDetails: getUserDetails(store),
    applications: store.applicationsState.applications
  }
}
export const FieldAgentHome = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction,
    goToFieldAgentHomeTab: goToFieldAgentHomeTabAction,
    deleteApplication
  }
)(injectIntl(FieldAgentHomeView))
