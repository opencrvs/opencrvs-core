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
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { RouteComponentProps } from 'react-router'
import { IApplication } from '@client/applications'
import {
  CorrectorForm,
  SupportingDocumentsForm
} from '@client/views/CorrectionForm'
import { CorrectionSection } from '@client/forms'
import { CorrectionReasonForm } from './CorrectionReasonForm'
import { CorrectionSummary } from './CorrectionSummary'

type IProps = IStateProps & IDispatchProps

function CorrectionFormComponent({ sectionId, ...props }: IProps) {
  switch (sectionId) {
    case CorrectionSection.Corrector:
      return <CorrectorForm {...props} />
    case CorrectionSection.Reason:
      return <CorrectionReasonForm {...props} />
    case CorrectionSection.SupportingDocuments:
      return <SupportingDocumentsForm {...props} />
    case CorrectionSection.Summary:
      return <CorrectionSummary {...props} />
  }
  return <></>
}

function mapStateToProps(state: IStoreState, props: IRouteProps) {
  const { applicationId, pageId: sectionId } = props.match.params
  const application = state.applicationsState.applications.find(
    ({ id }) => id === applicationId
  )
  console.log(application)
  if (!application) {
    throw new Error(`Draft "${applicationId}" missing!`)
  }

  return {
    application,
    sectionId
  }
}

type IStateProps = {
  application: IApplication
  sectionId: string
}

type IDispatchProps = {}

type IRouteProps = RouteComponentProps<{
  applicationId: string
  pageId: string
}>

export const CorrectionForm = connect<
  IStateProps,
  IDispatchProps,
  IRouteProps,
  IStoreState
>(mapStateToProps)(CorrectionFormComponent)
