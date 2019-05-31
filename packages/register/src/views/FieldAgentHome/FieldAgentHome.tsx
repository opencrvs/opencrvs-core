import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { RouteComponentProps, Redirect } from 'react-router'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { goToEvents as goToEventsAction } from 'src/navigation'
import { ISearchInputProps } from '@opencrvs/components/lib/interface'
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
  PlusTransparentWhite
} from '@opencrvs/components/lib/icons'
import { goToFieldAgentHomeTab as goToFieldAgentHomeTabAction } from '../../navigation'
import { REGISTRAR_HOME } from 'src/navigation/routes'
import { IApplication, SUBMISSION_STATUS } from 'src/applications'
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
interface IFieldAgentHomeProps {
  language: string
  userDetails: IUserDetails
  goToEvents: typeof goToEventsAction
  draftCount: string
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  applicationsReadyToSend: IApplication[]
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
  render() {
    const { userDetails, match, intl, applicationsReadyToSend } = this.props
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
    applicationsReadyToSend:
      (store.applicationsState.applications &&
        store.applicationsState.applications.filter(
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
    goToEvents: goToEventsAction,
    goToFieldAgentHomeTab: goToFieldAgentHomeTabAction
  }
)(injectIntl(FieldAgentHomeView))
