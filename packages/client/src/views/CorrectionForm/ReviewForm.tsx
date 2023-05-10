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
import { IDeclaration } from '@client/declarations'
import { IForm } from '@client/forms'
import { getEventReviewForm } from '@client/forms/register/review-selectors'
import { CERTIFICATE_CORRECTION_REVIEW, HOME } from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import { Event } from '@client/utils/gateway'
import {
  RegisterForm,
  RouteProps
} from '@client/views/RegisterForm/RegisterForm'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

type IStateProps = {
  declaration: IDeclaration | undefined
  registerForm: IForm
  pageRoute: string
}

type IProps = IStateProps & RouteProps

function CorrectionReviewFormComponent({ declaration, ...props }: IProps) {
  if (!declaration) {
    return <Redirect to={HOME} />
  }
  return <RegisterForm declaration={declaration} {...props} />
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { match } = props

  const { declarationId } = match.params

  const declaration = state.declarationsState.declarations.find(
    (app) => app.id === declarationId
  )

  const event = declaration?.event || Event.Birth

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
