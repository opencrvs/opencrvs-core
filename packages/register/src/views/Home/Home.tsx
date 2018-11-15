import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'

import { goToEvents as goToEventsAction } from 'src/navigation'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { ActionList, IconAction } from '@opencrvs/components/lib/buttons'
import { ActionTitle } from '@opencrvs/components/lib/buttons/IconAction'
import {
  Plus,
  DraftDocument,
  PendingDocument,
  CompleteDocument
} from '@opencrvs/components/lib/icons'
import styled from 'src/styled-components'

const messages = defineMessages({
  declareNewEventActionTitle: {
    id: 'register.home.buttons.registerNewEvent',
    defaultMessage: 'Declare a new vital event',
    description: 'The title for declaring new vital event on an action'
  },
  myDraftActionTitle: {
    id: 'register.home.buttons.mydraft',
    defaultMessage: 'My draft',
    description: 'The title for my draft on an action'
  },
  pendingSubmissionsActionTitle: {
    id: 'register.home.buttons.pendingSubimissions',
    defaultMessage: 'Pending submissions',
    description: 'The title for pending submissions on an action'
  },
  completedSubmissionsActionTitle: {
    id: 'register.home.buttons.completedSumissions',
    defaultMessage: 'Completd submissions',
    description: 'The title for completed submissions on an action'
  },
  logoutActionTitle: {
    id: 'register.home.logout',
    defaultMessage: 'Log out',
    description: 'The title for log out on an action'
  }
})

const StyledPlusIcon = styled(Plus)`
  display: flex;
  margin-left: -23px;
`
const StyledIconAction = styled(IconAction)`
  display: flex;
  min-height: 96px;
  padding: 0 20px 0 0;
  margin-bottom: 30px;
  box-shadow: 0 0 12px 1px rgba(0, 0, 0, 0.22);

  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    line-height: 1.3em;
    margin: -2px 0 -2px 120px;
  }
`

class HomeView extends React.Component<
  InjectedIntlProps & {
    goToEvents: typeof goToEventsAction
  }
> {
  render() {
    const { intl } = this.props
    return (
      <>
        <HomeViewHeader />
        <ActionList id="home_action_list">
          <StyledIconAction
            id="new_event_declaration"
            icon={() => <StyledPlusIcon />}
            onClick={this.props.goToEvents}
            title={intl.formatMessage(messages.declareNewEventActionTitle)}
          />
          <IconAction
            id="draft_documents"
            icon={() => <DraftDocument />}
            title={intl.formatMessage(messages.myDraftActionTitle)}
          />
          <IconAction
            id="pending_documents"
            icon={() => <PendingDocument />}
            title={intl.formatMessage(messages.pendingSubmissionsActionTitle)}
          />
          <IconAction
            id="submitted_documents"
            icon={() => <CompleteDocument />}
            title={intl.formatMessage(messages.completedSubmissionsActionTitle)}
          />
        </ActionList>
        <ViewFooter>
          <FooterAction>
            <FooterPrimaryButton>
              {intl.formatMessage(messages.logoutActionTitle)}
            </FooterPrimaryButton>
          </FooterAction>
        </ViewFooter>
      </>
    )
  }
}

export const Home = connect(null, { goToEvents: goToEventsAction })(
  injectIntl(HomeView)
)
