import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { Action, ActionList } from '@opencrvs/components/lib/buttons'
import { ViewHeader } from '../../components/ViewHeader'
import { goToBirthRegistration } from '../../navigation/navigationActions'

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
  }
})

class SelectVitalEventView extends React.Component<
  InjectedIntlProps & {
    goToBirthRegistration: typeof goToBirthRegistration
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
          <Action
            id="select_birth_event"
            title={intl.formatMessage(messages.birthActionTitle)}
            onClick={this.props.goToBirthRegistration}
          />
          <Action
            id="select_death_event"
            title={intl.formatMessage(messages.deathActionTitle)}
            disabled
          />
        </ActionList>
      </>
    )
  }
}

export const SelectVitalEvent = injectIntl(
  connect(null, { goToBirthRegistration })(SelectVitalEventView)
)
