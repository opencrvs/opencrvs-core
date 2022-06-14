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
import { IDeclaration, modifyDeclaration } from '@client/declarations'
import {
  CorrectorForm,
  SupportingDocumentsForm
} from '@client/views/CorrectionForm'
import { CorrectionSection } from '@client/forms'
import { CorrectionReasonForm } from './CorrectionReasonForm'
import { CorrectionSummary } from './CorrectionSummary'
import { Spinner } from '@opencrvs/components/lib/interface'
import styled from '@client/styledComponents'
import { TimeMounted } from '@client/components/TimeMounted'

const SpinnerWrapper = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

type IProps = IStateProps & IDispatchProps

function CorrectionFormComponent({ sectionId, ...props }: IProps) {
  const { declaration, modifyDeclaration } = props
  const logTime = React.useCallback(
    (timeMs: number) => {
      const declarationUpdated = declaration
      if (!declarationUpdated.timeLoggedMS) {
        declarationUpdated.timeLoggedMS = 0
      }
      declarationUpdated.timeLoggedMS += timeMs
      modifyDeclaration(declarationUpdated)
    },
    [modifyDeclaration, declaration]
  )

  if (props.isWritingDraft) {
    return (
      <SpinnerWrapper>
        <Spinner id="draft_write_loading" />
      </SpinnerWrapper>
    )
  }

  return (
    <TimeMounted onUnmount={logTime}>
      <FormSection sectionId={sectionId} {...props} />
    </TimeMounted>
  )
}

function FormSection({ sectionId, ...props }: IProps) {
  switch (sectionId) {
    case CorrectionSection.Corrector:
      return <CorrectorForm {...props} />
    case CorrectionSection.Reason:
      return <CorrectionReasonForm {...props} />
    case CorrectionSection.SupportingDocuments:
      return <SupportingDocumentsForm {...props} />
    case CorrectionSection.Summary:
      return <CorrectionSummary {...props} />
    default:
      return <></>
  }
}
function mapStateToProps(state: IStoreState, props: IRouteProps) {
  const { declarationId, pageId: sectionId } = props.match.params
  const declaration = state.declarationsState.declarations.find(
    ({ id }) => id === declarationId
  )

  if (!declaration) {
    throw new Error(`Draft "${declarationId}" missing!`)
  }

  return {
    declaration,
    sectionId,
    isWritingDraft: state.declarationsState.isWritingDraft
  }
}

type IStateProps = {
  declaration: IDeclaration
  sectionId: string
  isWritingDraft: boolean
}

type IDispatchProps = {
  modifyDeclaration: typeof modifyDeclaration
}

type IRouteProps = RouteComponentProps<{
  declarationId: string
  pageId: string
}>

export const CorrectionForm = connect<
  IStateProps,
  IDispatchProps,
  IRouteProps,
  IStoreState
>(mapStateToProps, { modifyDeclaration })(CorrectionFormComponent)
