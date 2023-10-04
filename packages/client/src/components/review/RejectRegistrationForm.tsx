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
import { FormFieldGenerator } from '@client/components/form'
import {
  IDeclaration,
  IPayload,
  SUBMISSION_STATUS,
  archiveDeclaration
} from '@client/declarations'
import { IFormSectionData, SubmissionAction } from '@client/forms'
import { hasFormError } from '@client/forms/utils'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/reject'
import styled from 'styled-components'
import { Event } from '@client/utils/gateway'
import {
  IRejectRegistrationForm,
  rejectRegistration
} from '@opencrvs/client/src/review/reject-registration'
import { IStoreState } from '@opencrvs/client/src/store'
import { Button } from '@opencrvs/components/lib/Button'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { goToHome } from '@client/navigation'
import { HOME } from '@client/navigation/routes'
import { RouteComponentProps } from 'react-router'

const Instruction = styled.div`
  margin-bottom: 28px;
`
interface IState {
  data: IFormSectionData
  enableSendForUpdateBtn: boolean
  enableArchiveBtn: boolean
}
interface IProps {
  draftId: string
  declaration: IDeclaration
  event: Event
  duplicate?: boolean
  onClose: () => void
  archiveDeclaration: typeof archiveDeclaration
  goToHome: typeof goToHome
  confirmRejectionEvent: (
    declaration: IDeclaration,
    status: string,
    action: SubmissionAction,
    payload: IPayload
  ) => void
}

type IFullProps = IntlShapeProps & IProps & { form: IRejectRegistrationForm }

class RejectRegistrationView extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      data: {},
      enableSendForUpdateBtn: false,
      enableArchiveBtn: false
    }
  }

  storeData = (rejectionFormData: IFormSectionData) => {
    this.setState(
      () => ({ data: rejectionFormData }),
      () =>
        this.setState(() => ({
          enableSendForUpdateBtn:
            this.shouldEnableSendForUpdateBtn(rejectionFormData),
          enableArchiveBtn: !hasFormError(
            this.props.form.fields,
            rejectionFormData
          )
        }))
    )
  }

  shouldEnableSendForUpdateBtn = (rejectionFormData: IFormSectionData) => {
    return (
      rejectionFormData &&
      !hasFormError(this.props.form.fields, rejectionFormData) &&
      isEmpty(rejectionFormData.rejectionReason)
    )
  }

  processSubmitData = () => {
    const reasons = this.state.data.rejectionReason as string[]
    let reason
    if (reasons) {
      reason = reasons.join()
    } else {
      reason = ''
    }
    return {
      id: this.props.draftId,
      reason,
      comment: this.state.data.rejectionCommentForHealthWorker
    }
  }

  render = () => {
    const { declaration, form, intl, confirmRejectionEvent, duplicate } =
      this.props
    const payload = this.processSubmitData()
    const { fields } = form
    if (duplicate) {
      fields.map((field) => {
        if (field.name === 'rejectionReason') {
          field.initialValue = ['duplicate']
        }
        return field
      })
    }

    return (
      <div id="reject-registration-form-container">
        <ResponsiveModal
          title={intl.formatMessage(messages.rejectionFormTitle)}
          show={true}
          width={918}
          contentHeight={270}
          handleClose={this.props.onClose}
          showHeaderBorder={true}
          actions={[
            <Button
              id="cancel"
              size="medium"
              type="tertiary"
              key="cancel"
              onClick={this.props.onClose}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              key="submit_archive"
              id="submit_archive"
              size="medium"
              type="secondary_negative"
              onClick={() => {
                this.props.archiveDeclaration(
                  payload.id,
                  payload.reason as string,
                  payload.comment as string
                )
                this.props.goToHome()
              }}
              disabled={!this.state.enableArchiveBtn}
            >
              {intl.formatMessage(buttonMessages.archive)}
            </Button>,
            <Button
              key="submit_reject_form"
              size="medium"
              type="negative"
              id="submit_reject_form"
              onClick={() =>
                confirmRejectionEvent(
                  declaration,
                  SUBMISSION_STATUS.READY_TO_REJECT,
                  SubmissionAction.REJECT_DECLARATION,
                  payload
                )
              }
              disabled={!this.state.enableSendForUpdateBtn}
            >
              {intl.formatMessage(buttonMessages.sendForUpdates)}
            </Button>
          ]}
        >
          <Instruction>
            {intl.formatMessage(messages.rejectionFormInstruction)}
          </Instruction>
          <FormFieldGenerator
            id="reject_form"
            fields={fields}
            onChange={this.storeData}
            setAllFieldsDirty={false}
          />
        </ResponsiveModal>
      </div>
    )
  }
}

export const RejectRegistrationForm = connect(
  (state: IStoreState) => ({
    form: rejectRegistration
  }),
  {
    archiveDeclaration,
    goToHome
  }
)(injectIntl(RejectRegistrationView))
