import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { Action, ActionList } from '@opencrvs/components/lib/buttons'

import { ViewHeader } from 'src/components/ViewHeader'
import { goToBirthRegistration, goToDeathRegistration } from 'src/navigation'
import { Dispatch } from 'redux'
import { createDraft, storeDraft } from 'src/drafts'
import { Event } from 'src/forms'
import { ShrinkedBody } from 'src/App'

export const messages = defineMessages({
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'Declare a new vital event',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventDesc: {
    id: 'register.selectVitalEvent.registerNewEventDesc',
    defaultMessage: 'Start by selecting the event you want to declare.',
    description: 'The description that appears on the select vital event page'
  },
  birthActionTitle: {
    id: 'register.selectVitalEvent.birthActionTitle',
    defaultMessage: 'Birth',
    description: 'The title for the birth event on an action component'
  },
  deathActionTitle: {
    id: 'register.selectVitalEvent.deathActionTitle',
    defaultMessage: 'Death',
    description: 'The title for the death event on an action component'
  },
  marriageActionTitle: {
    id: 'register.selectVitalEvent.marriageActionTitle',
    defaultMessage: 'Marriage',
    description: 'The title for the marriage event on an action component'
  },
  divorceActionTitle: {
    id: 'register.selectVitalEvent.divorceActionTitle',
    defaultMessage: 'Divorce',
    description: 'The title for the divorce event on an action component'
  },
  adoptionActionTitle: {
    id: 'register.selectVitalEvent.adoptionActionTitle',
    defaultMessage: 'Adoption',
    description: 'The title for the adoption event on an action component'
  }
})

class SelectVitalEventView extends React.Component<
  InjectedIntlProps & {
    goToBirthRegistration: typeof goToBirthRegistration
    goToDeathRegistration: () => void
  }
> {
  render() {
    const { intl } = this.props
    return (
      <>
        <ViewHeader
          title={intl.formatMessage(messages.registerNewEventTitle)}
          description={intl.formatMessage(messages.registerNewEventDesc)}
          id="select_vital_event_view"
        />
        <ActionList>
          <ShrinkedBody>
            <Action
              id="select_birth_event"
              title={intl.formatMessage(messages.birthActionTitle)}
              onClick={this.props.goToBirthRegistration}
            />
            <Action
              id="select_death_event"
              title={intl.formatMessage(messages.deathActionTitle)}
              onClick={this.props.goToDeathRegistration}
            />
            <Action
              id="select_marriage_event"
              title={intl.formatMessage(messages.marriageActionTitle)}
              disabled
            />
            <Action
              id="select_divorce_event"
              title={intl.formatMessage(messages.divorceActionTitle)}
              disabled
            />
            <Action
              id="select_adoption_event"
              title={intl.formatMessage(messages.adoptionActionTitle)}
              disabled
            />
          </ShrinkedBody>
        </ActionList>
      </>
    )
  }
}

export const SelectVitalEvent = connect(
  null,
  function mapDispatchToProps(dispatch: Dispatch) {
    return {
      goToBirthRegistration: () => dispatch(goToBirthRegistration()),
      goToDeathRegistration: () => {
        const draft = createDraft(Event.DEATH)
        dispatch(storeDraft(draft))
        dispatch(goToDeathRegistration(draft.id))
      }
    }
  }
)(injectIntl(SelectVitalEventView))
