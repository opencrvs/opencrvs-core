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
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  DRAFT_DEATH_FORM_PAGE_GROUP,
  DRAFT_MARRIAGE_FORM_PAGE_GROUP,
  HOME
} from '@client/navigation/routes'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { IStoreState } from '@client/store'
import { connect } from 'react-redux'
import { IForm } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { IDeclaration } from '@client/declarations'
import { Navigate } from 'react-router-dom'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'

interface IFormProps {
  declaration?: IDeclaration
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
}

const pageRoute: { [key in EventType]: string } = {
  birth: DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  death: DRAFT_DEATH_FORM_PAGE_GROUP,
  marriage: DRAFT_MARRIAGE_FORM_PAGE_GROUP
}

const DeclarationFormView = (props: RouteComponentProps<IFormProps>) => {
  const { declaration, ...rest } = props

  if (!declaration) {
    return <Navigate to={HOME} />
  }

  return <RegisterForm declaration={declaration} {...rest} />
}

function mapStatetoProps(state: IStoreState, props: RouteComponentProps) {
  const declaration = state.declarationsState.declarations.find(
    ({ id }) => id === props.router.params.declarationId
  )

  const event = declaration?.event || EventType.Birth
  const registerForm = getRegisterForm(state)[event]

  return {
    declaration,
    registerForm,
    pageRoute: pageRoute[event]
  }
}

export const DeclarationForm = withRouter(
  connect(mapStatetoProps)(DeclarationFormView)
)
