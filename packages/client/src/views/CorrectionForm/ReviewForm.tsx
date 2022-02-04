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
import {
  RouteProps,
  RegisterForm
} from '@client/views/RegisterForm/RegisterForm'
import { IForm } from '@client/forms'
import { IApplication } from '@client/applications'
import { IStoreState } from '@client/store'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { connect } from 'react-redux'
import { getEventReviewForm } from '@client/forms/register/review-selectors'

type IStateProps = {
  application: IApplication
  registerForm: IForm
  pageRoute: string
}

type IProps = IStateProps & RouteProps

function CorrectionReviewFormComponent(props: IProps) {
  return <RegisterForm {...props} />
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { match } = props

  const { applicationId } = match.params

  const application = state.applicationsState.applications.find(
    (app) => app.id === applicationId
  )

  if (!application) {
    throw new Error(`Application "${match.params.applicationId}" missing!`)
  }

  const event = application.event

  const reviewForm = getEventReviewForm(state, event)

  return {
    application,
    registerForm: reviewForm,
    pageRoute: CERTIFICATE_CORRECTION_REVIEW
  }
}

export const CorrectionReviewForm = connect(mapStateToProps)(
  CorrectionReviewFormComponent
)
