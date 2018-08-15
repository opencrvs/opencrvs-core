import * as React from 'react'

import { defineMessages } from 'react-intl'

import { ArrowWithGradient } from '@opencrvs/components/lib/icons'
import { Action, ActionList } from '@opencrvs/components/lib/buttons'

import { ViewHeader } from '../../components/ViewHeader'
import { goToBirthRegistrationAsParent } from '../../navigation/navigationActions'
import { connect } from 'react-redux'

export const messages = defineMessages({})

export class SelectInformantView extends React.Component<{
  goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
}> {
  render() {
    return (
      <>
        <ViewHeader
          breadcrump="New birth registration"
          title="Who is the informant?"
          description="Tell us who is providing the details, and check what information is needed to submit the form."
        />
        <ActionList>
          <Action
            id="select_parent_informant"
            title="Parent"
            description="Required: Details of the child, mother and informant. Optional: Details of the father."
            icon={() => <ArrowWithGradient />}
            onClick={this.props.goToBirthRegistrationAsParent}
          />
          <Action
            id="select_someone_else_informant"
            title="Someone else"
            description="Required: Details of the child and informant. Optional: Details of the mother/father."
            icon={() => <ArrowWithGradient />}
          />
          <Action
            id="select_self_informant"
            title="Self (18+)"
            description="Required: Details of the individual and informant. Optional: Details of the mother/father."
            icon={() => <ArrowWithGradient />}
          />
        </ActionList>
      </>
    )
  }
}

export const SelectInformant = connect(null, { goToBirthRegistrationAsParent })(
  SelectInformantView
)
