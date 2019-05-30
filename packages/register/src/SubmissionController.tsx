import ApolloClient from 'apollo-client'
import * as React from 'react'
import { connect } from 'react-redux'
import {
  IApplication,
  modifyApplication,
  SUBMISSION_STATUS
} from './applications'
import { Action, IForm } from './forms'
import { getRegisterForm } from './forms/register/application-selectors'
import { IStoreState } from './store'
import { createClient } from './utils/apolloClient'
import { getMutationMapping } from './views/DataProvider/MutationProvider'

type DispatchProps = {
  modifyApplication: typeof modifyApplication
}
type IProp = {
  client: ApolloClient<{}>
  applications: IApplication[]
  registerForms: Array<{ [key: string]: IForm }>
}

type FullProps = IProp & DispatchProps
class SubmissionControllerElem extends React.Component<FullProps> {
  constructor(prop: FullProps) {
    super(prop)
  }

  onSuccess = (application: IApplication) => {
    application.submissionStatus =
      SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]
    this.props.modifyApplication(application)
  }

  onError = (application: IApplication) => {
    application.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]
    this.props.modifyApplication(application)
  }

  render() {
    const { applications, registerForms, client } = this.props
    const application = applications.find(
      app => app.submissionStatus === SUBMISSION_STATUS.READY_TO_SUBMIT
    )
    if (application && navigator.onLine.toString() === 'POK') {
      console.log(application)
      const result = getMutationMapping(
        application.event,
        Action.SUBMIT_FOR_REVIEW,
        null,
        registerForms[application.event],
        application
      )
      const { mutation, variables } = result || {
        mutation: null,
        variables: null
      }

      client
        .mutate({ mutation, variables })
        .then(() => this.onSuccess(application))
        .catch(() => this.onError(application))
    }

    return null
  }
}

const mapStateToProps = (store: IStoreState) => {
  const registerForms: Array<{ [key: string]: IForm }> = []

  if (store.applicationsState.applications) {
    store.applicationsState.applications.map(application => {
      registerForms[application.event] = getRegisterForm(store)[
        application.event
      ]
    })
  }

  return {
    // @ts-ignore
    client: createClient(store),
    applications: store.applicationsState.applications || [],
    registerForms
  }
}
const mapDispatchToProps = {
  modifyApplication
}
export const SubmissionController = connect<IProp, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionControllerElem)
