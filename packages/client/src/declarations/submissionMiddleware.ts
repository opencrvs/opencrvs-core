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
import { IForm } from '@client/forms'
import { showUnassigned } from '@client/notification/actions'
import { FIELD_AGENT_ROLES } from '@client/utils/constants'

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type IReadyStatus = ArrayElement<typeof READY_STATUSES>

type IReadyDeclaration = IDeclaration & {
  submissionStatus: IReadyStatus
}

export const declarationReadyForStatusChange = createAction<IReadyDeclaration>(
  'DECLARATIONS/READY_FOR_STATUS_CHANGE'
)

export const READY_STATUSES = [
  SUBMISSION_STATUS.READY_TO_SUBMIT,
  SUBMISSION_STATUS.READY_TO_APPROVE,
  SUBMISSION_STATUS.READY_TO_REGISTER,
  SUBMISSION_STATUS.READY_TO_REJECT,
  SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
  SUBMISSION_STATUS.READY_TO_CERTIFY,
  SUBMISSION_STATUS.READY_TO_ARCHIVE
] as const

export function isReadyStatus(status: string): status is IReadyStatus {
  return READY_STATUSES.includes(status as IReadyStatus)
}

const STATUS_CHANGE_MAP = {
  [SUBMISSION_STATUS.READY_TO_SUBMIT]: SUBMISSION_STATUS.SUBMITTING,
  [SUBMISSION_STATUS.READY_TO_APPROVE]: SUBMISSION_STATUS.APPROVING,
  [SUBMISSION_STATUS.READY_TO_REGISTER]: SUBMISSION_STATUS.REGISTERING,
  [SUBMISSION_STATUS.READY_TO_REJECT]: SUBMISSION_STATUS.REJECTING,
  [SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION]:
    SUBMISSION_STATUS.REQUESTING_CORRECTION,
  [SUBMISSION_STATUS.READY_TO_CERTIFY]: SUBMISSION_STATUS.CERTIFYING,
  [SUBMISSION_STATUS.READY_TO_ARCHIVE]: SUBMISSION_STATUS.ARCHIVING
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
    const { event, submissionStatus } = declaration
    updateDeclaration(dispatch, {
      ...declaration,
      submissionStatus: STATUS_CHANGE_MAP[submissionStatus]
    })
    const gqlDetails = getGqlDetails(
      getRegisterForm(getState())[event],
      declaration
    )
    const mutation =
      event === Event.Birth
        ? getBirthMutation(submissionStatus)
        : getDeathMutation(submissionStatus)
    try {
      if (submissionStatus === SUBMISSION_STATUS.READY_TO_SUBMIT) {
        await client.mutate({
          mutation,
          variables: {
            details: gqlDetails
          }
        })
      } else if (submissionStatus === SUBMISSION_STATUS.READY_TO_REJECT) {
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
