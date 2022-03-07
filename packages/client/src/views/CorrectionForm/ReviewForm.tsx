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
import { IDeclaration } from '@client/declarations'
import { IStoreState } from '@client/store'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { connect } from 'react-redux'
import { getEventReviewForm } from '@client/forms/register/review-selectors'

type IStateProps = {
  declaration: IDeclaration
  registerForm: IForm
  pageRoute: string
}

type IProps = IStateProps & RouteProps

function CorrectionReviewFormComponent(props: IProps) {
  return <RegisterForm {...props} />
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { match } = props

  const { declarationId } = match.params

  const declaration = state.declarationsState.declarations.find(
    (app) => app.id === declarationId
  )

  if (!declaration) {
    throw new Error(`Declaration "${match.params.declarationId}" missing!`)
  }

  const event = declaration.event

  const reviewForm = getEventReviewForm(state, event)

  return {
    declaration,
    registerForm: reviewForm,
    pageRoute: CERTIFICATE_CORRECTION_REVIEW
  }
}

export const CorrectionReviewForm = connect(mapStateToProps)(
  CorrectionReviewFormComponent
)
