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
import { Middleware, Action, createAction } from '@reduxjs/toolkit'
import { IStoreState } from '@client/store'
import {
  SUBMISSION_STATUS,
  deleteDeclaration,
  IDeclaration,
  modifyDeclaration,
  writeDeclaration,
  updateRegistrarWorkqueue
} from '@client/declarations'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { client } from '@client/utils/apolloClient'
import { getBirthMutation } from '@client/views/DataProvider/birth/mutations'
import { Event } from '@client/utils/gateway'
import { getDeathMutation } from '@client/views/DataProvider/death/mutations'
import {
  draftToGqlTransformer,
  appendGqlMetadataFromDraft
} from '@client/transformer'
import { Dispatch } from 'redux'
import { IForm, SubmissionAction } from '@client/forms'
import { showUnassigned } from '@client/notification/actions'
import { FIELD_AGENT_ROLES } from '@client/utils/constants'

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
  [SubmissionAction.REQUEST_CORRECTION_DECLARATION]:
    SUBMISSION_STATUS.REQUESTING_CORRECTION,
  [SubmissionAction.COLLECT_CERTIFICATE]: SUBMISSION_STATUS.CERTIFYING,
  [SubmissionAction.ARCHIVE_DECLARATION]: SUBMISSION_STATUS.ARCHIVING
} as const

function getGqlDetails(form: IForm, draft: IDeclaration) {
  const gqlDetails = draftToGqlTransformer(
    form,
    draft.data,
    draft.id,
    draft.originalData
  )
  appendGqlMetadataFromDraft(draft, gqlDetails)
  return gqlDetails
}

function updateDeclaration(dispatch: Dispatch, declaration: IDeclaration) {
  dispatch(modifyDeclaration(declaration))
  dispatch(writeDeclaration(declaration))
}

function updateWorkqueue(store: IStoreState, dispatch: Dispatch) {
  const role = store.offline.userDetails?.role
  const isFieldAgent = role && FIELD_AGENT_ROLES.includes(role) ? true : false
  const userId = store.offline.userDetails?.practitionerId
  dispatch(updateRegistrarWorkqueue(userId, 10, isFieldAgent))
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
    updateDeclaration(dispatch, {
      ...declaration,
      submissionStatus: STATUS_CHANGE_MAP[submissionAction]
    })
    const gqlDetails = getGqlDetails(
      getRegisterForm(getState())[event],
      declaration
    )
    const mutation =
      event === Event.Birth
        ? getBirthMutation(submissionAction)
        : getDeathMutation(submissionAction)
    try {
      if (submissionAction === SubmissionAction.SUBMIT_FOR_REVIEW) {
        await client.mutate({
          mutation,
          variables: {
            details: gqlDetails
          }
        })
      } else if (submissionAction === SubmissionAction.REJECT_DECLARATION) {
        await client.mutate({
          mutation,
          variables: {
            ...declaration.payload
          }
        })
      } else {
        await client.mutate({
          mutation,
          variables: {
            id: declaration.id,
            details: gqlDetails
          }
        })
      }
      updateWorkqueue(getState(), dispatch)
      dispatch(deleteDeclaration(declaration.id))
    } catch (error) {
      if (error.graphQLErrors?.[0]?.extensions.code === 'UNASSIGNED') {
        dispatch(
          showUnassigned({
            trackingId: declaration.data.registration.trackingId as string
          })
        )
        dispatch(deleteDeclaration(declaration.id))
      }
      updateDeclaration(dispatch, {
        ...declaration,
        submissionStatus: error.networkError
          ? SUBMISSION_STATUS.FAILED_NETWORK
          : SUBMISSION_STATUS.FAILED
      })
    }
  }
