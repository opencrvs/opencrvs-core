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
import { RouteComponentProps } from 'react-router'
import {
  RegisterForm,
  IFormProps,
  RouteProps
} from '@opencrvs/client/src/views/RegisterForm/RegisterForm'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  DRAFT_DEATH_FORM_PAGE_GROUP
} from '@opencrvs/client/src/navigation/routes'
import { getRegisterForm } from '@opencrvs/client/src/forms/register/application-selectors'
import { IStoreState } from '@opencrvs/client/src/store'
import { connect } from 'react-redux'
import { Event } from '@client/forms'

const pageRoute: { [key in Event]: string } = {
  birth: DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  death: DRAFT_DEATH_FORM_PAGE_GROUP
}

export class ApplicationFormView extends React.Component<
  IFormProps & RouteProps
> {
  render() {
    return <RegisterForm {...this.props} />
  }
}

function mapStatetoProps(state: IStoreState, props: RouteProps) {
  const { match } = props
  const application = state.applicationsState.applications.find(
    ({ id }) => id === match.params.applicationId
  )

  if (!application) {
    throw new Error(`Draft "${match.params.applicationId}" missing!`)
  }

  const event = application.event

  if (!event) {
    throw new Error(`Event is not specified in Draft`)
  }

  const registerForm = getRegisterForm(state)[event]

  return {
    application,
    registerForm,
    pageRoute: pageRoute[event]
  }
}

export const ApplicationForm = connect<IFormProps, {}, RouteProps, IStoreState>(
  mapStatetoProps
)(ApplicationFormView)
