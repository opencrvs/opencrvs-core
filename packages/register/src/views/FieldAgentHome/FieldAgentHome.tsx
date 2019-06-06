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
import { ISearchInputProps } from '@opencrvs/components/lib/interface'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'

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
import styled from 'styled-components'
import { IUserDetails } from '../../utils/userUtils'
import { SentForReview } from './SentForReview'
import { InProgress } from './InProgress'

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
  }
})
interface IBaseFieldAgentHomeProps {
  language: string
  userDetails: IUserDetails
  tabId: string
  draftApplications: IApplication[]
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

  render() {
    const {
      draftApplications,
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
                  total: draftApplications.length
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
            {tabId === TAB_ID.inProgress && (
              <InProgress draftApplications={draftApplications} />
            )}

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
    draftApplications:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      [],
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
