import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import {
  RegisterForm,
  IFormProps,
  FullProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
import {
  DRAFT_BIRTH_PARENT_FORM_TAB,
  DRAFT_DEATH_FORM_TAB
} from '@opencrvs/register/src/navigation/routes'
import { getRegisterForm } from '@opencrvs/register/src/forms/register/application-selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { Event, IForm } from '@register/forms'
import { Scope } from '@register/utils/authUtils'
import { IApplication } from '@register/applications'

const tabRoute: { [key in Event]: string } = {
  birth: DRAFT_BIRTH_PARENT_FORM_TAB,
  death: DRAFT_DEATH_FORM_TAB
}
export class ApplicationFormView extends React.Component<FullProps> {
  render() {
    return <RegisterForm {...this.props} />
  }
}

interface StateProps {
  application: IApplication
  registerForm: IForm
  tabRoute: string
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; applicationId: string }>
): StateProps {
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

export const ApplicationForm = connect<
  StateProps,
  {},
  IFormProps & RouteComponentProps<{ tabId: string; applicationId: string }>,
  IStoreState
>(mapStatetoProps)(ApplicationFormView)
