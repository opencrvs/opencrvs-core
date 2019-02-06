import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Event, Action, IForm } from 'src/forms'
import { getBirthMutationMappings } from './birth/mutations'
import { Mutation } from 'react-apollo'
import { IDraft } from 'src/drafts'
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
const MutationMapper = {
  [Event.BIRTH]: getBirthMutationMappings
}

class MutationProviderView extends React.Component<IProps> {
  getMutationMapping() {
    const { event, action, form, draft } = this.props
    const eventMutationMapping =
      MutationMapper[event] && MutationMapper[event](action, form, draft)
    if (!eventMutationMapping) {
      return null
    }
    return eventMutationMapping
  }

  render() {
    const { onCompleted, showModal, toggleModal } = this.props
    if (!showModal) {
      return null
    }
    const eventMutationMapping = this.getMutationMapping()
    if (!eventMutationMapping) {
      return null
    }
    return (
      <Mutation
        mutation={eventMutationMapping.mutation}
        variables={eventMutationMapping.variables || null}
        onCompleted={data => onCompleted(data[eventMutationMapping.dataKey])}
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
