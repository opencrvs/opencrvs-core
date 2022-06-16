/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import ApolloClient, { ApolloError } from 'apollo-client'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import {
  IDeclaration,
  modifyDeclaration,
  writeDeclaration,
  SUBMISSION_STATUS,
  updateRegistrarWorkqueue,
  deleteDeclaration
} from '@client/declarations'
import { Action } from '@client/forms'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { AppStore } from '@client/store'
import { getMutationMapping } from '@client/views/DataProvider/MutationProvider'
import { REGISTRATION_HOME_QUERY } from '@client/views/OfficeHome/queries'
import { getOperationName } from 'apollo-utilities'
import { client } from '@client/utils/apolloClient'
import { FetchResult, DocumentNode } from 'apollo-link'
import { getAttachmentSectionKey } from './utils/draftUtils'
import { getScope } from './profile/profileSelectors'
import { RequestHandler } from 'mock-apollo-client'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import { GraphQLError } from 'graphql'
import { showUnassigned } from '@client/notification/actions'
import { FIELD_AGENT_ROLES } from './utils/constants'

const INTERVAL_TIME = 5000
const HANGING_EXPIRE_MINUTES = 15
const ALLOWED_STATUS_FOR_RETRY = [
  SUBMISSION_STATUS.READY_TO_SUBMIT.toString(),
  SUBMISSION_STATUS.READY_TO_APPROVE.toString(),
  SUBMISSION_STATUS.READY_TO_REGISTER.toString(),
  SUBMISSION_STATUS.READY_TO_REJECT.toString(),
  SUBMISSION_STATUS.READY_TO_ARCHIVE.toString(),
  SUBMISSION_STATUS.READY_TO_CERTIFY.toString(),
  SUBMISSION_STATUS.READY_TO_REINSTATE.toString(),
  SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION.toString(),
  SUBMISSION_STATUS.FAILED_NETWORK.toString()
]
const INPROGRESS_STATUS = [
  SUBMISSION_STATUS.SUBMITTING.toString(),
  SUBMISSION_STATUS.APPROVING.toString(),
  SUBMISSION_STATUS.REGISTERING.toString(),
  SUBMISSION_STATUS.REJECTING.toString(),
  SUBMISSION_STATUS.ARCHIVING.toString(),
  SUBMISSION_STATUS.REINSTATING.toString(),
  SUBMISSION_STATUS.CERTIFYING.toString(),
  SUBMISSION_STATUS.REQUESTING_CORRECTION.toString()
]
const changeStatus = {
  [SUBMISSION_STATUS.SUBMITTING.toString()]: SUBMISSION_STATUS.READY_TO_SUBMIT,
  [SUBMISSION_STATUS.APPROVING.toString()]: SUBMISSION_STATUS.READY_TO_APPROVE,
  [SUBMISSION_STATUS.REGISTERING.toString()]:
    SUBMISSION_STATUS.READY_TO_REGISTER,
  [SUBMISSION_STATUS.REJECTING.toString()]: SUBMISSION_STATUS.READY_TO_REJECT,
  [SUBMISSION_STATUS.ARCHIVING.toString()]: SUBMISSION_STATUS.READY_TO_ARCHIVE,
  [SUBMISSION_STATUS.REINSTATING.toString()]:
    SUBMISSION_STATUS.READY_TO_REINSTATE,
  [SUBMISSION_STATUS.CERTIFYING.toString()]: SUBMISSION_STATUS.READY_TO_CERTIFY,
  [SUBMISSION_STATUS.REQUESTING_CORRECTION.toString()]:
    SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION
}

interface IActionList {
  [key: string]: string
}

const ACTION_LIST: IActionList = {
  [Action.SUBMIT_FOR_REVIEW]: Action.SUBMIT_FOR_REVIEW,
  [Action.APPROVE_DECLARATION]: Action.APPROVE_DECLARATION,
  [Action.REGISTER_DECLARATION]: Action.REGISTER_DECLARATION,
  [Action.REJECT_DECLARATION]: Action.REJECT_DECLARATION,
  [Action.COLLECT_CERTIFICATE]: Action.COLLECT_CERTIFICATE,
  [Action.REQUEST_CORRECTION_DECLARATION]:
    Action.REQUEST_CORRECTION_DECLARATION,
  [Action.REINSTATE_DECLARATION]: Action.REINSTATE_DECLARATION,
  [Action.COLLECT_CERTIFICATE]: Action.COLLECT_CERTIFICATE,
  [Action.ARCHIVE_DECLARATION]: Action.ARCHIVE_DECLARATION
}
const REQUEST_IN_PROGRESS_STATUS: IActionList = {
  [Action.SUBMIT_FOR_REVIEW]: SUBMISSION_STATUS.SUBMITTING,
  [Action.APPROVE_DECLARATION]: SUBMISSION_STATUS.APPROVING,
  [Action.REGISTER_DECLARATION]: SUBMISSION_STATUS.REGISTERING,
  [Action.REJECT_DECLARATION]: SUBMISSION_STATUS.REJECTING,
  [Action.ARCHIVE_DECLARATION]: SUBMISSION_STATUS.ARCHIVING,
  [Action.REINSTATE_DECLARATION]: SUBMISSION_STATUS.REINSTATING,
  [Action.COLLECT_CERTIFICATE]: SUBMISSION_STATUS.CERTIFYING,
  [Action.REQUEST_CORRECTION_DECLARATION]:
    SUBMISSION_STATUS.REQUESTING_CORRECTION
}
const SUCCESS_SUBMISSION_STATUS: IActionList = {
  [Action.SUBMIT_FOR_REVIEW]: SUBMISSION_STATUS.SUBMITTED,
  [Action.ARCHIVE_DECLARATION]: SUBMISSION_STATUS.ARCHIVED,
  [Action.REINSTATE_DECLARATION]: SUBMISSION_STATUS.REINSTATED,
  [Action.APPROVE_DECLARATION]: SUBMISSION_STATUS.APPROVED,
  [Action.REGISTER_DECLARATION]: SUBMISSION_STATUS.REGISTERED,
  [Action.REJECT_DECLARATION]: SUBMISSION_STATUS.REJECTED,
  [Action.COLLECT_CERTIFICATE]: SUBMISSION_STATUS.CERTIFIED,
  [Action.REQUEST_CORRECTION_DECLARATION]:
    SUBMISSION_STATUS.REQUESTED_CORRECTION
}

export class SubmissionController {
  private store: AppStore
  public client: ApolloClient<{}> & {
    setRequestHandler: (query: DocumentNode, handler: RequestHandler) => void // used for mocking in tests
  }
  public syncRunning = false
  private syncCount = 0

  constructor(store: AppStore) {
    this.store = store
    this.client = client
  }

  public start = () => {
    setInterval(() => {
      this.sync()
    }, INTERVAL_TIME)
  }

  private getDeclarations = () =>
    this.store.getState().declarationsState.declarations || []

  private getSubmitableDeclarations = () => {
    return this.getDeclarations().filter(
      (app: IDeclaration) =>
        app.submissionStatus &&
        ALLOWED_STATUS_FOR_RETRY.includes(app.submissionStatus)
    )
  }
  public requeueHangingDeclarations = async () => {
    const now = Date.now()
    this.getDeclarations()
      .filter((app: IDeclaration) => {
        return (
          app.submissionStatus &&
          INPROGRESS_STATUS.includes(app.submissionStatus) &&
          app.modifiedOn &&
          differenceInMinutes(now, app.modifiedOn) > HANGING_EXPIRE_MINUTES
        )
      })
      .forEach(async (app: IDeclaration) => {
        if (app.submissionStatus) {
          app.submissionStatus = changeStatus[app.submissionStatus]
          await this.store.dispatch(modifyDeclaration(app))
          await this.store.dispatch(writeDeclaration(app))
        }
      })
  }
  /* eslint-disable no-console */

  public sync = async () => {
    this.syncCount++
    console.debug(`[${this.syncCount}] Starting sync...`)
    if (!navigator.onLine || this.syncRunning) {
      console.debug(
        `[${this.syncCount}] Sync exiting early (offline or already syncing)`
      )
      return
    }

    this.syncRunning = true

    await this.requeueHangingDeclarations()
    const declarations = this.getSubmitableDeclarations()
    console.debug(
      `[${this.syncCount}] Syncing ${declarations.length} declarations`
    )
    for (const declaration of declarations) {
      await this.callMutation(declaration)
    }

    this.syncRunning = false
    console.debug(`[${this.syncCount}] Finish sync.`)
  }

  /* eslint-enable no-console */

  private callMutation = async (declaration: IDeclaration | undefined) => {
    if (!declaration) {
      return
    }

    const declarationAction = ACTION_LIST[declaration.action || ''] || null

    const forms = getRegisterForm(this.store.getState())

    const result = getMutationMapping(
      declaration.event,
      // @ts-ignore
      declarationAction,
      declaration.payload,
      forms[declaration.event],
      declaration
    )
    const { mutation, variables } = result || {
      mutation: null,
      variables: null
    }

    const requestInProgressStatus =
      REQUEST_IN_PROGRESS_STATUS[declaration.action || ''] ||
      SUBMISSION_STATUS.SUBMITTING
    declaration.submissionStatus = requestInProgressStatus
    await this.store.dispatch(modifyDeclaration(declaration))
    await this.store.dispatch(writeDeclaration(declaration))

    if (mutation) {
      try {
        const mutationResult = await this.client.mutate({
          mutation,
          variables,
          refetchQueries: [getOperationName(REGISTRATION_HOME_QUERY) || ''],
          awaitRefetchQueries: true
        })
        await this.onSuccess(declaration, mutationResult)
      } catch (exception) {
        await this.onError(declaration, exception)
      }
    }
  }

  private onSuccess = async (
    declaration: IDeclaration,
    result: FetchResult<any, any, any>
  ) => {
    const submissionStatus =
      SUCCESS_SUBMISSION_STATUS[declaration.action || ''] ||
      SUBMISSION_STATUS.SUBMITTED

    declaration.submissionStatus = submissionStatus

    if (declaration.action === Action.REINSTATE_DECLARATION) {
      declaration.submissionStatus = ''
      declaration.registrationStatus =
        result.data.markEventAsReinstated.registrationStatus
    }
    const response =
      (result && result.data && result.data.createBirthRegistration) ||
      (result && result.data && result.data.createDeathRegistration) ||
      null
    if (response) {
      const { compositionId, trackingId } = response
      if (compositionId) {
        declaration.compositionId = compositionId
      }
      if (trackingId) {
        declaration.trackingId = trackingId
      }
    }
    //It needs some times to elasticSearch to update index
    const role = this.store.getState().offline.userDetails?.role
    const isFieldAgent = role && FIELD_AGENT_ROLES.includes(role) ? true : false
    const userId = this.store.getState().offline.userDetails?.practitionerId
    await this.store.dispatch(
      updateRegistrarWorkqueue(userId, 10, isFieldAgent)
    )
    await this.store.dispatch(modifyDeclaration(declaration))

    if (
      declaration.submissionStatus === SUBMISSION_STATUS.SUBMITTED ||
      declaration.submissionStatus === SUBMISSION_STATUS.APPROVED ||
      declaration.submissionStatus === SUBMISSION_STATUS.REGISTERED ||
      declaration.submissionStatus === SUBMISSION_STATUS.REJECTED ||
      declaration.submissionStatus === SUBMISSION_STATUS.ARCHIVED ||
      declaration.submissionStatus === SUBMISSION_STATUS.REINSTATED ||
      declaration.submissionStatus === SUBMISSION_STATUS.REQUESTED_CORRECTION
    ) {
      await this.store.dispatch(deleteDeclaration(declaration))
    } else {
      await this.store.dispatch(writeDeclaration(declaration))
    }
  }

  private onError = async (declaration: IDeclaration, error: ApolloError) => {
    let status
    if (error.networkError) {
      status = SUBMISSION_STATUS.FAILED_NETWORK
    } else if (error.graphQLErrors?.[0].extensions.code === 'UNASSIGNED') {
      this.store.dispatch(
        showUnassigned({
          trackingId: declaration.data.registration.trackingId as string
        })
      )
      this.store.dispatch(deleteDeclaration(declaration))
    } else {
      status = SUBMISSION_STATUS.FAILED
      Sentry.captureException(error)
    }

    declaration.submissionStatus = status
    await this.store.dispatch(modifyDeclaration(declaration))
    await this.store.dispatch(writeDeclaration(declaration))
  }
}
