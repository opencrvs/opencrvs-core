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
import {
  RegisterForm,
  RouteProps
} from '@opencrvs/client/src/views/RegisterForm/RegisterForm'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  DRAFT_DEATH_FORM_PAGE_GROUP,
  DRAFT_MARRIAGE_FORM_PAGE_GROUP,
  HOME
} from '@opencrvs/client/src/navigation/routes'
import { getRegisterForm } from '@opencrvs/client/src/forms/register/declaration-selectors'
import { IStoreState } from '@opencrvs/client/src/store'
import { connect } from 'react-redux'
import { IForm } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { IDeclaration } from '@client/declarations'
import { Redirect } from 'react-router'

interface IFormProps {
  declaration?: IDeclaration
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
}

const pageRoute: { [key in Event]: string } = {
  birth: DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  death: DRAFT_DEATH_FORM_PAGE_GROUP,
  marriage: DRAFT_MARRIAGE_FORM_PAGE_GROUP
}

class DeclarationFormView extends React.Component<IFormProps & RouteProps> {
  render() {
    const { declaration, ...rest } = this.props
    if (!declaration) {
      return <Redirect to={HOME} />
    }
    return <RegisterForm declaration={declaration} {...rest} />
  }
}

function mapStatetoProps(state: IStoreState, props: RouteProps) {
  const { match } = props
  const declaration = state.declarationsState.declarations.find(
    ({ id }) => id === match.params.declarationId
  )

  const event = declaration?.event || Event.Birth
  const registerForm = getRegisterForm(state)[event]

  return {
    declaration,
    registerForm,
    pageRoute: pageRoute[event]
  }
}

export const DeclarationForm = connect<IFormProps, {}, RouteProps, IStoreState>(
  mapStatetoProps
)(DeclarationFormView)
