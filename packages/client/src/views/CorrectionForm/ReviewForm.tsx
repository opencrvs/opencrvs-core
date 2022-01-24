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
import { RegisterForm } from '@opencrvs/client/src/views/RegisterForm/RegisterForm'

import { IStoreState } from '@opencrvs/client/src/store'
import { connect } from 'react-redux'
import { getEventReviewForm } from '@opencrvs/client/src/forms/register/review-selectors'
import { IApplication } from '@opencrvs/client/src/applications'
import { IForm } from '@client/forms'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { RouteProps } from '@client/views/RegisterForm/RegisterForm'

type IState = {
  application: IApplication
  registerForm: IForm
  pageRoute: string
}

type IFullProps = IState & RouteProps

function ReviewFormView(props: IFullProps) {
  return <RegisterForm {...props} />
}

function mapStatetoProps(state: IStoreState, props: RouteProps) {
  const { applicationId } = props.match.params

  const application = state.applicationsState.applications.find(
    ({ id }) => id === applicationId
  )

  if (!application) {
    throw new Error(`Draft "${applicationId}" missing!`)
  }

  const event = application.event

  return {
    application,
    registerForm: getEventReviewForm(state, event),
    pageRoute: CERTIFICATE_CORRECTION_REVIEW
  }
}

export const CorrectionReviewForm = connect<
  IState,
  {},
  RouteProps,
  IStoreState
>(mapStatetoProps)(ReviewFormView)
