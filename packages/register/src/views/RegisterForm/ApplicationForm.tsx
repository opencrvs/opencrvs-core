import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps } from 'react-intl'
import {
  RegisterForm,
  IFormProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
import { DRAFT_BIRTH_PARENT_FORM_TAB } from '@opencrvs/register/src/navigation/routes'
import { getRegisterForm } from '@opencrvs/register/src/forms/register/application-selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'

type IProps = IFormProps & InjectedIntlProps & RouteComponentProps<{}>

export class ApplicationFormView extends React.Component<IProps> {
  render() {
    return <RegisterForm {...this.props} />
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match } = props
  const registerForm = getRegisterForm(state)
  console.log(state.drafts.drafts)
  const draft = state.drafts.drafts.find(
    ({ id }) => id === match.params.draftId
  )

  if (!draft) {
    throw new Error(`Draft "${match.params.draftId}" missing!`)
  }
  return {
    draft,
    registerForm,
    tabRoute: DRAFT_BIRTH_PARENT_FORM_TAB
  }
}

export const ApplicationForm = connect<IFormProps>(mapStatetoProps)(
  ApplicationFormView
)
