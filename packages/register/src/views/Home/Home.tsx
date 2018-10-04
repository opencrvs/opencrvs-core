import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'

import { goToEvents as goToEventsAction } from 'src/navigation'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { ActionList, IconAction } from '@opencrvs/components/lib/buttons'
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
  }
})

const StyledPlusIcon = styled(Plus)`
  max-width: 120px;
  display: flex;
  height: 100%;
  background-color: rgb(94, 147, 237);
`
const StyledIconAction = styled(IconAction)`
  height: 100%;
  padding: 0px;
  padding-right: 15px;
  position: relative;
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
        <ActionList>
          <StyledIconAction
            icon={() => <StyledPlusIcon />}
            prominent
            title={intl.formatMessage(messages.declareNewEventActionTitle)}
          />
          <IconAction
            icon={() => <DraftDocument />}
            title={intl.formatMessage(messages.myDraftActionTitle)}
          />
          <IconAction
            icon={() => <PendingDocument />}
            title={intl.formatMessage(messages.pendingSubmissionsActionTitle)}
          />
          <IconAction
            icon={() => <CompleteDocument />}
            title={intl.formatMessage(messages.completedSubmissionsActionTitle)}
          />
        </ActionList>
      </>
    )
  }
}

export const Home = injectIntl(
  connect(null, { goToEvents: goToEventsAction })(HomeView)
)
