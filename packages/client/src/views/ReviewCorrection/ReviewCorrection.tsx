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
import * as React from 'react'
import styled from 'styled-components'
import { Content } from '@opencrvs/components/lib/Content'

import { useIntl } from 'react-intl'
import {
  Redirect,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch
} from 'react-router'
import { useRecord } from '@client/hooks/useRecord'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

import { RegisterForm } from '@client/views/RegisterForm/RegisterForm'
import { useDispatch, useSelector } from 'react-redux'
import { CorrectionInput, Event, History } from '@client/utils/gateway'
import { getEventReviewForm } from '@client/forms/register/review-selectors'
import { IStoreState } from '@client/store'

import { merge } from 'lodash'
import {
  IDeclaration,
  SUBMISSION_STATUS,
  modifyDeclaration,
  writeDeclaration
} from '@client/declarations'
import { SubmissionAction } from '@client/forms'

type URLParams = { declarationId: string }

function applyCorrectionToData(record: IDeclaration) {
  const history = record.data.history as unknown as History[]
  if (!history) {
    throw new Error('No history found from declaration. Should never happen')
  }

  const correctionRequestTask = history.find(
    (task: History) => task.action === 'REQUESTED_CORRECTION'
  )

  if (!correctionRequestTask) {
    throw new Error('No correction request task found. Should never happen')
  }

  if (!correctionRequestTask.input) {
    throw new Error(
      'Correction request task did not have an input field. Should never happen'
    )
  }

  const proposedChangesPatch = correctionRequestTask.input.reduce(
    (acc: Record<string, Record<string, string>>, curr: any) => {
      acc[curr.valueCode] = acc[curr.valueCode] || {}
      acc[curr.valueCode][curr.valueId] = curr.valueString
      return acc
    },
    {}
  )

  const correction: CorrectionInput = {
    attachments: correctionRequestTask.documents.map((document) => ({
      _fhirID: document.id
    })),
    hasShowedVerifiedDocument: correctionRequestTask.hasShowedVerifiedDocument!,
    noSupportingDocumentationRequired:
      correctionRequestTask.noSupportingDocumentationRequired!,
    location: {
      _fhirID: correctionRequestTask.location!.id
    },
    note: '', //correctionRequestTask.note!,
    otherReason: correctionRequestTask.otherReason!,
    payment: correctionRequestTask.payment && {
      _fhirID: correctionRequestTask.payment.id,
      type: correctionRequestTask.payment.type,
      amount: correctionRequestTask.payment.amount,
      outcome: correctionRequestTask.payment.outcome,
      date: correctionRequestTask.payment.date
    },
    reason: correctionRequestTask.reason!,
    requester: correctionRequestTask.requester!,
    values: correctionRequestTask.input.map((input) => ({
      fieldName: input!.valueId,
      newValue: input!.valueString,
      section: input!.valueCode,
      oldValue: (record.data[input!.valueCode][input!.valueId] as string) || ''
    }))
  }

  const declarationData = merge({}, record.data, proposedChangesPatch)

  return {
    ...record,
    data: {
      ...declarationData,
      registration: {
        ...declarationData.registration,
        correction: correction
      }
    }
  }
}

export function ReviewCorrection() {
  const { declarationId } = useParams<URLParams>()
  const match = useRouteMatch()

  const location = useLocation()
  const history = useHistory()

  const dispatch = useDispatch()

  const registerForm = useSelector((state: IStoreState) =>
    getEventReviewForm(state, Event.Birth)
  )

  const records = useRecord()
  const record = records.findById(declarationId)

  if (!record) {
    return (
      <Redirect
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyForReview,
          selectorId: ''
        })}
      />
    )
  }

  const recordWithProposedChanges = applyCorrectionToData(record)

  return (
    <>
      <button
        onClick={() => {
          const recordWithSubmissionStatus = {
            ...recordWithProposedChanges,
            submissionStatus: SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
            action: SubmissionAction.APPROVE_CORRECTION
          }
          dispatch(modifyDeclaration(recordWithSubmissionStatus))
          dispatch(writeDeclaration(recordWithSubmissionStatus))
        }}
      >
        test
      </button>
      <RegisterForm
        match={{
          ...match,
          params: {
            declarationId: record.id,
            pageId: 'review',
            groupId: 'review-view-group'
          }
        }}
        pageRoute={''}
        location={location}
        history={history}
        registerForm={registerForm}
        declaration={recordWithProposedChanges}
      />
    </>
  )
}
