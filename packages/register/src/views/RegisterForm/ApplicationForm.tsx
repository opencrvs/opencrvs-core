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
  FullProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  DRAFT_DEATH_FORM_PAGE_GROUP
} from '@opencrvs/register/src/navigation/routes'
import { getRegisterForm } from '@opencrvs/register/src/forms/register/application-selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { Event, IForm } from '@register/forms'
import { IApplication } from '@register/applications'

const pageRoute: { [key in Event]: string } = {
  birth: DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  death: DRAFT_DEATH_FORM_PAGE_GROUP
}
export class ApplicationFormView extends React.Component<FullProps> {
  render() {
    return <RegisterForm {...this.props} />
  }
}

interface StateProps {
  application: IApplication
  registerForm: IForm
  pageRoute: string
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ pageId: string; applicationId: string }>
): StateProps {
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

export const ApplicationForm = connect<
  StateProps,
  {},
  IFormProps &
    RouteComponentProps<{
      pageId: string
      groupId: string
      applicationId: string
    }>,
  IStoreState
>(mapStatetoProps)(ApplicationFormView)
