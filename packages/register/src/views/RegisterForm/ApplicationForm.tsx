import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps } from 'react-intl'
import {
  RegisterForm,
  IFormProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
import {
  DRAFT_BIRTH_PARENT_FORM_TAB,
  DRAFT_DEATH_FORM_TAB
} from '@opencrvs/register/src/navigation/routes'
import { getRegisterForm } from '@opencrvs/register/src/forms/register/application-selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { Event } from '@register/forms'
import { Scope } from '@register/utils/authUtils'

type IProps = IFormProps &
  InjectedIntlProps & { scope: Scope } & RouteComponentProps<{}>

const tabRoute: { [key in Event]: string } = {
  birth: DRAFT_BIRTH_PARENT_FORM_TAB,
  death: DRAFT_DEATH_FORM_TAB
}
export class ApplicationFormView extends React.Component<IProps> {
  render() {
    return <RegisterForm {...this.props} />
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; applicationId: string }>
) {
  const { match } = props
  const application = state.applicationsState.applications.find(
    ({ id }) => id === match.params.applicationId
  )

  if (!application) {
    throw new Error(`Draft "${match.params.applicationId}" missing!`)
  }

  const event = application.event

  if (!event) {
    throw new Error(`Event is not specified in Draft`)
  }

  const registerForm = getRegisterForm(state)[event]

  return {
    application,
    registerForm,
    tabRoute: tabRoute[event]
  }
}

export const ApplicationForm = connect<IFormProps>(mapStatetoProps)(
  ApplicationFormView
)
