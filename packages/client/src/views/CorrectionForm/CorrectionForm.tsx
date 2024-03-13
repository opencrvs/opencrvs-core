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
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { Redirect, RouteComponentProps } from 'react-router'
import { IDeclaration, modifyDeclaration } from '@client/declarations'
import {
  CorrectorForm,
  SupportingDocumentsForm
} from '@client/views/CorrectionForm'
import { CorrectionSection } from '@client/forms'
import { CorrectionReasonForm } from './CorrectionReasonForm'
import { CorrectionSummary } from './CorrectionSummary'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import styled from 'styled-components'
import { TimeMounted } from '@client/components/TimeMounted'
import { HOME } from '@client/navigation/routes'

const SpinnerWrapper = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

type IProps = IStateProps & IDispatchProps

function CorrectionFormComponent({ sectionId, declaration, ...props }: IProps) {
  const { modifyDeclaration } = props
  const logTime = React.useCallback(
    (timeMs: number) => {
      if (declaration) {
        const declarationUpdated = declaration
        if (!declarationUpdated.timeLoggedMS) {
          declarationUpdated.timeLoggedMS = 0
        }
        declarationUpdated.timeLoggedMS += timeMs
        modifyDeclaration(declarationUpdated)
      }
    },
    [modifyDeclaration, declaration]
  )

  if (!declaration) {
    return <Redirect to={HOME} />
  }

  if (declaration.writingDraft) {
    return (
      <SpinnerWrapper>
        <Spinner id="draft_write_loading" />
      </SpinnerWrapper>
    )
  }

  return (
    <TimeMounted onUnmount={logTime}>
      <FormSection sectionId={sectionId} declaration={declaration} {...props} />
    </TimeMounted>
  )
}

function FormSection({
  sectionId,
  ...props
}: IProps & { declaration: IDeclaration }) {
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

  return {
    declaration,
    sectionId
  }
}

type IStateProps = ReturnType<typeof mapStateToProps>

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
