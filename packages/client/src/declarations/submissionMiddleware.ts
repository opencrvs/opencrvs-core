/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { ApolloError } from '@apollo/client'
import {
  ICertificate,
  IDeclaration,
  Payment,
  SUBMISSION_STATUS,
  deleteDeclaration,
  modifyDeclaration,
  writeDeclaration
} from '@client/declarations'
import { IForm, SubmissionAction } from '@client/forms'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import {
  showDuplicateRecordsToast,
  showUnassigned
} from '@client/notification/actions'
import { IStoreState } from '@client/store'
import {
  appendGqlMetadataFromDraft,
  draftToGqlTransformer,
  getChangedValues
} from '@client/transformer'
import { client } from '@client/utils/apolloClient'
import { EventType, RegStatus } from '@client/utils/gateway'
import {
  MARK_EVENT_AS_DUPLICATE,
  getBirthMutation
} from '@client/views/DataProvider/birth/mutations'
import { getDeathMutation } from '@client/views/DataProvider/death/mutations'
import { getMarriageMutation } from '@client/views/DataProvider/marriage/mutations'
import { NOT_A_DUPLICATE } from '@client/views/DataProvider/mutation'
import { updateRegistrarWorkqueue } from '@client/workqueue'
import { Action, Middleware, createAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import type { MutationToRequestRegistrationCorrectionArgs } from '@client/utils/gateway-deprecated-do-not-use'
import { UserDetails } from '@client/utils/userUtils'
// eslint-disable-next-line no-restricted-imports
import { captureException } from '@sentry/browser'

type IReadyDeclaration = IDeclaration & {
  action: SubmissionAction
}

export const declarationReadyForStatusChange = createAction<IReadyDeclaration>(
  'DECLARATIONS/READY_FOR_STATUS_CHANGE'
)

const STATUS_CHANGE_MAP = {
  [SubmissionAction.SUBMIT_FOR_REVIEW]: SUBMISSION_STATUS.SUBMITTING,
  [SubmissionAction.APPROVE_DECLARATION]: SUBMISSION_STATUS.APPROVING,
  [SubmissionAction.REGISTER_DECLARATION]: SUBMISSION_STATUS.REGISTERING,
  [SubmissionAction.REJECT_DECLARATION]: SUBMISSION_STATUS.REJECTING,
  [SubmissionAction.REQUEST_CORRECTION]:
    SUBMISSION_STATUS.REQUESTING_CORRECTION,
  [SubmissionAction.MAKE_CORRECTION]: SUBMISSION_STATUS.REQUESTING_CORRECTION,
  [SubmissionAction.APPROVE_CORRECTION]: SUBMISSION_STATUS.APPROVING,
  [SubmissionAction.REJECT_CORRECTION]: SUBMISSION_STATUS.REJECTING,
  [SubmissionAction.CERTIFY_DECLARATION]: SUBMISSION_STATUS.CERTIFYING,
  [SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION]:
    SUBMISSION_STATUS.CERTIFYING,
  [SubmissionAction.ISSUE_DECLARATION]: SUBMISSION_STATUS.ISSUING,
  [SubmissionAction.ARCHIVE_DECLARATION]: SUBMISSION_STATUS.ARCHIVING
} as const

function getGqlDetails(
  form: IForm,
  draft: IDeclaration,
  offlineData: IOfflineData,
  userDetails: UserDetails | null
) {
  const gqlDetails = draftToGqlTransformer(
    form,
    draft.data,
    draft.id,
    userDetails,
    offlineData,
    draft.originalData
  )
  appendGqlMetadataFromDraft(draft, gqlDetails)
  return gqlDetails
}

export function updateDeclaration(
  dispatch: Dispatch,
  declaration: IDeclaration
) {
  dispatch(modifyDeclaration(declaration))
  dispatch(writeDeclaration(declaration))
}

function updateWorkqueue(store: IStoreState, dispatch: Dispatch) {
  const userId = store.offline.userDetails?.practitionerId
  dispatch(updateRegistrarWorkqueue(userId, 10))
}

function isCorrectionAction(action: SubmissionAction) {
  return [
    SubmissionAction.REQUEST_CORRECTION,
    SubmissionAction.MAKE_CORRECTION,
    SubmissionAction.APPROVE_CORRECTION,
    SubmissionAction.REJECT_CORRECTION
  ].includes(action)
}

function isValidationAction(action: SubmissionAction) {
  return [SubmissionAction.APPROVE_DECLARATION].includes(action)
}

function isRegisterAction(action: SubmissionAction) {
  return [SubmissionAction.REGISTER_DECLARATION].includes(action)
}

async function removeDuplicatesFromCompositionAndElastic(
  declaration: IDeclaration,
  submissionAction: SubmissionAction
) {
  if (
    declaration.isNotDuplicate &&
    [
      SubmissionAction.REGISTER_DECLARATION,
      SubmissionAction.REJECT_DECLARATION,
      SubmissionAction.APPROVE_DECLARATION
    ].includes(submissionAction)
  ) {
    await client.mutate({
      mutation: NOT_A_DUPLICATE,
      variables: {
        id: declaration.id
      }
    })
  }
}

export const submissionMiddleware: Middleware<{}, IStoreState> =
  ({ dispatch, getState }) =>
  (next) =>
  async (action: Action) => {
    next(action)
    if (!declarationReadyForStatusChange.match(action)) {
      return
    }
    const declaration = action.payload
    const { event, action: submissionAction } = declaration
    let payments: Payment | undefined
    updateDeclaration(dispatch, {
      ...declaration,
      submissionStatus: STATUS_CHANGE_MAP[submissionAction]
    })
    //If SubmissionAction is certify and issue declaration then remove payment for certify first
    if (submissionAction === SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION) {
      const certificate = (
        declaration.data.registration.certificates as ICertificate[]
      )?.[0]
      if (certificate) {
        payments = certificate.payments
        delete certificate.payments
      }
    }

    const isUpdateAction =
      isValidationAction(submissionAction) ||
      isRegisterAction(submissionAction) ||
      isCorrectionAction(submissionAction)

    const form = isUpdateAction
      ? getReviewForm(getState())[event]
      : getRegisterForm(getState())[event]

    const offlineData = getOfflineData(getState())
    const graphqlPayload = getGqlDetails(
      form,
      declaration,
      getOfflineData(getState()),
      getState().offline.userDetails as UserDetails
    )

    if (isCorrectionAction(submissionAction)) {
      const changedValues = getChangedValues(
        form,
        declaration,
        offlineData,
        getState().offline.userDetails as UserDetails
      )
      graphqlPayload.registration ??= {}
      graphqlPayload.registration.correction =
        declaration.data.registration.correction ?? {}
      graphqlPayload.registration.correction.values = changedValues
    }

    if (isUpdateAction && !isCorrectionAction(submissionAction)) {
      const changedValues = getChangedValues(
        form,
        declaration,
        offlineData,
        getState().offline.userDetails as UserDetails
      )
      graphqlPayload.registration ??= {}
      graphqlPayload.registration.changedValues = changedValues
    }

    //then add payment while issue declaration
    if (payments) {
      ;(
        declaration.data.registration.certificates as ICertificate[]
      )[0].payments = payments
    }

    const mutation =
      event === EventType.Birth
        ? getBirthMutation(submissionAction)
        : event === EventType.Death
          ? getDeathMutation(submissionAction)
          : getMarriageMutation(submissionAction)

    if (!mutation) {
      throw new Error(
        'Unknown mutation for submission action ' + submissionAction
      )
    }

    try {
      if (submissionAction === SubmissionAction.SUBMIT_FOR_REVIEW) {
        const response = await client.mutate({
          mutation,
          variables: {
            details: graphqlPayload
          }
        })

        const { isPotentiallyDuplicate, trackingId, compositionId } =
          response?.data?.createBirthRegistration ??
          response?.data?.createDeathRegistration ??
          {}

        if (isPotentiallyDuplicate) {
          dispatch(
            showDuplicateRecordsToast({
              trackingId,
              compositionId
            })
          )
        }
      } else if (submissionAction === SubmissionAction.REQUEST_CORRECTION) {
        await client.mutate<
          { requestRegistrationCorrection: string },
          MutationToRequestRegistrationCorrectionArgs
        >({
          mutation,
          variables: {
            id: declaration.id,
            details: graphqlPayload.registration.correction
          }
        })
      } else if (
        [
          SubmissionAction.REJECT_DECLARATION,
          SubmissionAction.ARCHIVE_DECLARATION,
          SubmissionAction.REJECT_CORRECTION
        ].includes(submissionAction)
      ) {
        if (
          declaration.payload?.reason === 'duplicate' &&
          SubmissionAction.ARCHIVE_DECLARATION === submissionAction
        ) {
          await client.mutate({
            mutation: MARK_EVENT_AS_DUPLICATE,
            variables: {
              ...declaration.payload
            }
          })
        }
        await removeDuplicatesFromCompositionAndElastic(
          declaration,
          submissionAction
        )
        await client.mutate({
          mutation,
          variables: {
            ...declaration.payload
          }
        })
      } else if (
        submissionAction === SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION
      ) {
        await client.mutate({
          mutation,
          variables: {
            id: declaration.id,
            details: graphqlPayload
          }
        })
        updateDeclaration(dispatch, {
          ...declaration,
          registrationStatus: RegStatus.Certified,
          action: SubmissionAction.ISSUE_DECLARATION,
          submissionStatus: SUBMISSION_STATUS.READY_TO_ISSUE
        })
        return
      } else {
        await removeDuplicatesFromCompositionAndElastic(
          declaration,
          submissionAction
        )
        await client.mutate({
          mutation,
          variables: {
            id: declaration.id,
            details: graphqlPayload
          }
        })
      }
      updateWorkqueue(getState(), dispatch)

      // wrapping deleteDeclaration inside a setTimeout
      // make deleteDeclaration wait a bit until workqueue refreshes
      // because for the deleteDeclaration's updates, there was an "workqueue count flickering" issue ticket
      // This is a "quick fix" for the issue #5268://github.com/opencrvs/opencrvs-core/issues/5268
      setTimeout(
        () => dispatch(deleteDeclaration(declaration.id, client)),
        2000
      )
    } catch (error) {
      if (
        error instanceof ApolloError &&
        error.graphQLErrors.length > 0 &&
        error.graphQLErrors[0].extensions.code === 'UNASSIGNED'
      ) {
        dispatch(
          showUnassigned({
            trackingId: declaration.data.registration.trackingId as string
          })
        )
        dispatch(deleteDeclaration(declaration.id, client))
        return
      }
      if (error instanceof ApolloError && error.networkError) {
        updateDeclaration(dispatch, {
          ...declaration,
          submissionStatus: SUBMISSION_STATUS.FAILED_NETWORK
        })
        captureException(error)
        return
      }

      updateDeclaration(dispatch, {
        ...declaration,
        submissionStatus: SUBMISSION_STATUS.FAILED
      })
      captureException(error)
    }
  }
