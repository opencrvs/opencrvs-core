import ApolloClient, { ApolloError } from 'apollo-client'
import * as Sentry from '@sentry/browser'
import {
  IApplication,
  modifyApplication,
  SUBMISSION_STATUS
} from '@register/applications'
import { Action, IForm } from '@register/forms'
import { getRegisterForm } from '@register/forms/register/application-selectors'
import { AppStore } from '@register/store'
import { createClient } from '@register/utils/apolloClient'
import { getMutationMapping } from '@register/views/DataProvider/MutationProvider'
import { FetchResult } from 'react-apollo'

const INTERVAL_TIME = 5000
const ALLOWED_STATUS_FOR_RETRY = [
  SUBMISSION_STATUS.READY_TO_SUBMIT.toString(),
  SUBMISSION_STATUS.READY_TO_REGISTER.toString(),
  SUBMISSION_STATUS.READY_TO_REJECT.toString(),
  SUBMISSION_STATUS.FAILED_NETWORK.toString()
]

interface IActionList {
  [key: string]: string
}

const ACTION_LIST: IActionList = {
  [Action.SUBMIT_FOR_REVIEW]: Action.SUBMIT_FOR_REVIEW,
  [Action.REGISTER_APPLICATION]: Action.REGISTER_APPLICATION,
  [Action.REJECT_APPLICATION]: Action.REJECT_APPLICATION
}
const REQUEST_IN_PROGRESS_STATUS: IActionList = {
  [Action.SUBMIT_FOR_REVIEW]: SUBMISSION_STATUS.SUBMITTING,
  [Action.REGISTER_APPLICATION]: SUBMISSION_STATUS.REGISTERING,
  [Action.REJECT_APPLICATION]: SUBMISSION_STATUS.REJECTING
}
const SUCCESS_SUBMISSION_STATUS: IActionList = {
  [Action.SUBMIT_FOR_REVIEW]: SUBMISSION_STATUS.SUBMITTED,
  [Action.REGISTER_APPLICATION]: SUBMISSION_STATUS.REGISTERED,
  [Action.REJECT_APPLICATION]: SUBMISSION_STATUS.REJECTED
}

export class SubmissionController {
  private store: AppStore
  private client: ApolloClient<{}>
  private registerForms: { [key: string]: IForm }
  private syncRunning: boolean = false
  private syncCount: number = 0

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
      (app: IApplication) =>
        app.submissionStatus &&
        ALLOWED_STATUS_FOR_RETRY.includes(app.submissionStatus)
    )
  }

  private sync = async () => {
    this.syncCount++
    console.debug(`[${this.syncCount}] Starting sync...`)
    if (!navigator.onLine || this.syncRunning) {
      console.debug(
        `[${this.syncCount}] Sync exiting early (offline or already syncing)`
      )
      return
    }

    this.syncRunning = true

    const applications = this.getSubmitableApplications()
    console.debug(
      `[${this.syncCount}] Syncing ${applications.length} applications`
    )
    for (const application of applications) {
      await this.callMutation(application)
    }

    this.syncRunning = false
    console.debug(`[${this.syncCount}] Finish sync.`)
  }

  private callMutation = async (application: IApplication | undefined) => {
    if (!application) {
      return
    }

    const applicationAction = ACTION_LIST[application.action || ''] || null
    const result = getMutationMapping(
      application.event,
      // @ts-ignore
      applicationAction,
      application.payload,
      this.registerForms[application.event],
      application
    )
    const { mutation, variables } = result || {
      mutation: null,
      variables: null
    }

    const requestInProgressStatus =
      REQUEST_IN_PROGRESS_STATUS[application.action || ''] ||
      SUBMISSION_STATUS.SUBMITTING
    application.submissionStatus = requestInProgressStatus
    this.store.dispatch(modifyApplication(application))

    try {
      const mutationResult = await this.client.mutate({ mutation, variables })
      this.onSuccess(application, mutationResult)
    } catch (exception) {
      this.onError(application, exception)
    }
  }

  private onSuccess = (application: IApplication, result: FetchResult) => {
    const submissionStatus =
      SUCCESS_SUBMISSION_STATUS[application.action || ''] ||
      SUBMISSION_STATUS.SUBMITTED
    application.submissionStatus = submissionStatus
    if (result && result.data && result.data.createBirthRegistration) {
      const { compositionId, trackingId } = result.data.createBirthRegistration
      if (compositionId) {
        application.compositionId = compositionId
      }
      if (trackingId) {
        application.trackingId = trackingId
      }
    }
    this.store.dispatch(modifyApplication(application))
  }

  private onError = (application: IApplication, error: ApolloError) => {
    let status
    if (error.networkError) {
      status = SUBMISSION_STATUS.FAILED_NETWORK
    } else {
      status = SUBMISSION_STATUS.FAILED
      Sentry.captureException(error)
    }

    application.submissionStatus = status
    this.store.dispatch(modifyApplication(application))
  }
}
