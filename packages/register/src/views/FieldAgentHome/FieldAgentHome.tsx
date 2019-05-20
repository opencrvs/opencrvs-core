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
import { Button, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import {
  StatusProgress,
  StatusOrange,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import { goToFieldAgentHomeTab as goToFieldAgentHomeTabAction } from '../../navigation'
import { REGISTRAR_HOME } from 'src/navigation/routes'

const Topbar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 50px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const IconTab = styled(Button).attrs<{ active: boolean }>({})`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: ${({ theme, active }) => (active ? 'bold' : theme.void)};
  height: 50px;
  font-size: 14px;
  border-bottom: ${({ active }) => (active ? '3px solid' : '')}
    ${({ theme }) => theme.colors.accentLight};
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & > div {
    padding: 0 16px;
  }
  & div > div:first-child {
    margin-right: 8px;
  }

  &:focus {
    outline: 0;
  }
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
    userDetails: getUserDetails(store)
  }
}
export const FieldAgentHome = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction,
    goToFieldAgentHomeTab: goToFieldAgentHomeTabAction
  }
)(injectIntl(FieldAgentHomeView))
