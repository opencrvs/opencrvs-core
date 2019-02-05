import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Event, Action, IForm } from 'src/forms'
import { SUBMIT_BIRTH_APPLICATION } from './birth/mutations'
import { Mutation } from 'react-apollo'
import { IDraft } from 'src/drafts'
import { draftToGqlTransformer } from 'src/transformer'
import { SubmitConfirmation } from './SubmitConfirmation'

interface IMutationProviderProps {
  event: Event
  action: Action
  form: IForm
  draft: IDraft
  showModal: boolean
  toggleModal: () => void
  onCompleted: (data: any) => void
  onLoading?: () => void
  onError?: (error: any) => void
}
type IProps = IMutationProviderProps & InjectedIntlProps

const MutationMapping = {
  [Action.SUBMIT_FOR_REVIEW]: {
    [Event.BIRTH]: {
      mutation: SUBMIT_BIRTH_APPLICATION,
      resultKey: 'createBirthRegistration'
    }
  }
}
class MutationProviderView extends React.Component<IProps> {
  getMutationMapping() {
    const { event, action, form, draft } = this.props
    const eventMutationMapping = MutationMapping[action][event]
    if (!eventMutationMapping) {
      return null
    }
    if (action === Action.SUBMIT_FOR_REVIEW) {
      if (event === Event.BIRTH) {
        eventMutationMapping.variables = {
          details: draftToGqlTransformer(form, draft.data)
        }
      }
    }
    return eventMutationMapping
  }

  render() {
    const { onCompleted, showModal, toggleModal } = this.props
    const eventMutationMapping = this.getMutationMapping()
    if (!eventMutationMapping) {
      return null
    }
    return (
      <Mutation
        mutation={eventMutationMapping.mutation}
        variables={(showModal && eventMutationMapping.variables) || null}
        onCompleted={data => onCompleted(data[eventMutationMapping.resultKey])}
      >
        {submitMutation => {
          return (
            <SubmitConfirmation
              showModal={showModal}
              submitButtonId="submit-confirm"
              closeButtonId="toggle-btn"
              toggleModal={toggleModal}
              mutationCall={() => submitMutation()}
            />
          )
        }}
      </Mutation>
    )
  }
}

export const MutationProvider = injectIntl(MutationProviderView)
