import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages } from 'react-intl'

import { ArrowWithGradient } from '@opencrvs/components/lib/icons'
import { Action, ActionList } from '@opencrvs/components/lib/buttons'

import { ViewHeader } from '../../components/ViewHeader'
import { goToBirthRegistration } from '../../navigation/navigationActions'

export const messages = defineMessages({})

class SelectVitalEventView extends React.Component<{
  goToBirthRegistration: typeof goToBirthRegistration
}> {
  render() {
    return (
      <>
        <ViewHeader
          title="Register a new vital event"
          description="Start by selecting the event you want to register."
        />
        <ActionList>
          <Action
            id="select_birth_event"
            title="Birth"
            icon={() => <ArrowWithGradient />}
            onClick={this.props.goToBirthRegistration}
          />
          <Action
            id="select_death_event"
            title="Death"
            icon={() => <ArrowWithGradient />}
          />
        </ActionList>
      </>
    )
  }
}

export const SelectVitalEvent = connect(null, { goToBirthRegistration })(
  SelectVitalEventView
)
