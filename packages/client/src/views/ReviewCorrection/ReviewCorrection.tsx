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

import { RegisterForm } from '../RegisterForm/RegisterForm'
import { useSelector } from 'react-redux'
import { Event, History } from '@client/utils/gateway'
import { getEventReviewForm } from '@client/forms/register/review-selectors'
import { IStoreState } from '@client/store'

import { merge } from 'lodash'

type URLParams = { recordId: string }

function applyCorrectionToData(record: any) {
  if (!record.data.history) {
    // Should never happen
    return record
  }

  const correctionRequestTask = record.data.history.find(
    (task: History) => task.action === 'REQUESTED_CORRECTION'
  )

  const patch = correctionRequestTask.input.reduce(
    (acc: Record<string, Record<string, string>>, curr: any) => {
      acc[curr.valueCode] = acc[curr.valueCode] || {}
      acc[curr.valueCode][curr.valueId] = curr.valueString
      return acc
    },
    {}
  )

  return {
    ...record,
    data: merge(record.data, patch)
  }
}

export function ReviewCorrection() {
  const { recordId } = useParams<URLParams>()
  const match = useRouteMatch()

  const location = useLocation()
  const history = useHistory()

  const registerForm = useSelector((state: IStoreState) =>
    getEventReviewForm(state, Event.Birth)
  )

  const records = useRecord()
  const record = records.findById(recordId)

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
  )
}
