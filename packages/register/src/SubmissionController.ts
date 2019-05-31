import ApolloClient from 'apollo-client'
import { indexOf } from 'lodash'
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
  private applications: IApplication[] = []
  private registerForms: Array<{ [key: string]: IForm }> = []
  private syncRunning: boolean = false

  constructor(store: AppStore) {
    this.store = store
    this.client = createClient(store)
    this.subscribeToStore()
  }

  public start = () => {
    let application

    setInterval(() => {
      application = this.getSubmitableApplication()
      this.callMutation(application)
    }, INTERVAL_TIME)
  }

  private subscribeToStore = () => {
    let application
    this.store.subscribe(() => {
      this.applications =
        this.store.getState().applicationsState.applications || []
      this.applications.map(app => {
        this.registerForms[app.event] = getRegisterForm(this.store.getState())[
          app.event
        ]
      })
      application = this.getSubmitableApplication()
      this.callMutation(application)
    })
  }

  private getSubmitableApplication = () => {
    return this.applications.find(
      app => indexOf(ALLOWED_STATUS_FOR_RETRY, app.submissionStatus) > -1
    )
  }

  private callMutation = (application: IApplication | undefined) => {
    if (!navigator.onLine || this.syncRunning || !application) {
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

    this.syncRunning = true
    application.submissionStatus =
      SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTING]
    modifyApplication(application)
    this.client
      .mutate({ mutation, variables })
      .then(() => this.onSuccess(application))
      .catch(exception =>
        this.onError(application, exception.networkError.statusCode)
      )
  }

  private onSuccess = (application: IApplication) => {
    this.syncRunning = false
    application.submissionStatus =
      SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]
    this.store.dispatch(modifyApplication(application))
  }

  private onError = (application: IApplication, httpCode: number) => {
    const status =
      ALLOWED_STATUS_CODE.indexOf(httpCode) > -1
        ? SUBMISSION_STATUS.FAILED_NETWORK
        : SUBMISSION_STATUS.FAILED
    this.syncRunning = false
    application.submissionStatus = status
    this.store.dispatch(modifyApplication(application))
  }
}
