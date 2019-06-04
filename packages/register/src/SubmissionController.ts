import ApolloClient from 'apollo-client'
import {
  IApplication,
  modifyApplication,
  SUBMISSION_STATUS
} from './applications'
import { Action, IForm } from './forms'
import { getRegisterForm } from './forms/register/application-selectors'
import { AppStore } from './store'
import { createClient } from './utils/apolloClient'
import { getMutationMapping } from './views/DataProvider/MutationProvider'

const INTERVAL_TIME = 5000
const ALLOWED_STATUS_CODE = [503, 408]
const ALLOWED_STATUS_FOR_RETRY = [
  SUBMISSION_STATUS.READY_TO_SUBMIT.toString(),
  SUBMISSION_STATUS.FAILED_NETWORK.toString()
]

export class SubmissionController {
  private store: AppStore
  private client: ApolloClient<{}>
  private registerForms: { [key: string]: IForm }
  private syncRunning: boolean = false

  constructor(store: AppStore) {
    this.store = store
    this.client = createClient(store)
    this.registerForms = getRegisterForm(this.store.getState())
  }

  public start = () => {
    setInterval(() => {
      this.sync()
    }, INTERVAL_TIME)
  }

  private getApplications = () =>
    this.store.getState().applicationsState.applications || []

  private getSubmitableApplications = () => {
    return this.getApplications().filter(
      app =>
        app.submissionStatus &&
        ALLOWED_STATUS_FOR_RETRY.includes(app.submissionStatus)
    )
  }

  private sync = async () => {
    console.debug('Starting sync...')
    if (!navigator.onLine || this.syncRunning) {
      console.debug('Sync exiting early (offline or already syncing)')
      return
    }

    this.syncRunning = true

    const applications = this.getSubmitableApplications()
    for (const application of applications) {
      await this.callMutation(application)
    }

    this.syncRunning = false
    console.debug('Finish sync.')
  }

  private callMutation = async (application: IApplication | undefined) => {
    if (!application) {
      return
    }

    const result = getMutationMapping(
      application.event,
      Action.SUBMIT_FOR_REVIEW,
      null,
      this.registerForms[application.event],
      application
    )
    const { mutation, variables } = result || {
      mutation: null,
      variables: null
    }

    application.submissionStatus = SUBMISSION_STATUS.SUBMITTING
    modifyApplication(application)

    try {
      await this.client.mutate({ mutation, variables })
      this.onSuccess(application)
    } catch (exception) {
      this.onError(application, exception.networkError.statusCode)
    }
  }

  private onSuccess = (application: IApplication) => {
    application.submissionStatus =
      SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]
    this.store.dispatch(modifyApplication(application))
  }

  // TODO: fix error detection when network is out
  private onError = (application: IApplication, httpCode: number) => {
    const status = ALLOWED_STATUS_CODE.includes(httpCode)
      ? SUBMISSION_STATUS.FAILED_NETWORK
      : SUBMISSION_STATUS.FAILED
    application.submissionStatus = status
    this.store.dispatch(modifyApplication(application))
  }
}
