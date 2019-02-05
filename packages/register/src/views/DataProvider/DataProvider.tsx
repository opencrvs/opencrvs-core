import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Scope } from '@opencrvs/register/src/utils/authUtils'
import { Event, Action, IForm } from 'src/forms'
import { SUBMIT_BIRTH_APPLICATION } from './birth/mutations'
import { Mutation } from 'react-apollo'
import { IDraft } from 'src/drafts'
import { draftToGqlTransformer } from 'src/apis/payload-transformers'
import { SubmitConfirmation } from './SubmitConfirmation'

interface IDataProviderProps {
  event: Event
  action: Action
  scope: Scope
  form: IForm
  draft: IDraft
  showModal: boolean
  toggleModal: () => void
  onCompleted: (data: any) => void
  onLoading?: () => void
  onError?: (error: any) => void
}
type IProps = IDataProviderProps & InjectedIntlProps

export class DataProviderView extends React.Component<IProps> {
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }
  render() {
    const {
      event,
      action,
      onCompleted,
      form,
      draft,
      showModal,
      toggleModal
    } = this.props
    switch (action) {
      case Action.SUBMIT_FOR_REVIEW:
        if (event === Event.BIRTH) {
          return (
            <Mutation
              mutation={SUBMIT_BIRTH_APPLICATION}
              variables={{ details: draftToGqlTransformer(form, draft.data) }}
              onCompleted={data => onCompleted(data.createBirthRegistration)}
            >
              {submitMutation => {
                return (
                  <SubmitConfirmation
                    showModal={showModal}
                    submitButtonId="submit_confirm"
                    closeButtonId="preview-btn"
                    toggleModal={toggleModal}
                    mutationCall={() => submitMutation()}
                  />
                )
              }}
            </Mutation>
          )
        }
        break
      case Action.REGISTER_APPLICATION:
        break
      case Action.REJECT_APPLICATION:
        break
      case Action.COLLECT_CERTIFICATE:
        break
    }
    return <></>
  }
}

export const DataProvider = injectIntl(DataProviderView)
