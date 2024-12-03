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
import * as React from 'react'
import { RegisterForm } from '@client/views/RegisterForm/RegisterForm'
import { IForm } from '@client/forms'
import { IDeclaration } from '@client/declarations'
import { IStoreState } from '@client/store'
import { CERTIFICATE_CORRECTION_REVIEW, HOME } from '@client/navigation/routes'
import { connect } from 'react-redux'
import { getEventReviewForm } from '@client/forms/register/review-selectors'
import { EventType } from '@client/utils/gateway'
import { Navigate } from 'react-router-dom'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'

type IStateProps = {
  declaration: IDeclaration | undefined
  registerForm: IForm
  pageRoute: string
}

type IProps = RouteComponentProps<IStateProps>

function CorrectionReviewFormComponent({ declaration, ...props }: IProps) {
  if (!declaration) {
    return <Navigate to={HOME} />
  }

  return <RegisterForm declaration={declaration} {...props} />
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps
): IStateProps {
  const { match } = props.router

  const { declarationId } = match.params

  const declaration = state.declarationsState.declarations.find(
    (app) => app.id === declarationId
  )

  const event = declaration?.event || EventType.Birth

  const reviewForm = getEventReviewForm(state, event)

  return {
    declaration,
    registerForm: reviewForm,
    pageRoute: CERTIFICATE_CORRECTION_REVIEW
  }
}

export const CorrectionReviewForm = withRouter(
  connect(mapStateToProps)(CorrectionReviewFormComponent)
)
