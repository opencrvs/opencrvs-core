import {
  IDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { FormFieldGenerator } from '@client/components/form'
import { ResponsiveModal } from '@opencrvs/components'
import {
  SuccessButton,
  TertiaryButton,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import React from 'react'
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/register'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { goToHomeTab } from '@client/navigation'
import styled from 'styled-components'
import { IFormSectionData } from '@client/forms'
import {
  IRejectCorrectionForm,
  rejectCorrection
} from '@client/review/reject-correction'

const Instruction = styled.div`
  margin-bottom: 28px;
`

interface IChildrenProps {
  toggleRejectModal: () => void
  toggleApproveModal: () => void
}

interface IProps {
  declaration: IDeclaration
  children(props: IChildrenProps): React.ReactNode
}

type DispatchProps = {
  writeDeclaration: typeof writeDeclaration
  goToHomeTab: typeof goToHomeTab
}

type FullProps = IProps & IntlShapeProps & { form: IRejectCorrectionForm }

type State = {
  data: IFormSectionData
  approvePrompt: boolean
  rejectPrompt: boolean
}

class ReviewSectionCorrectionComp extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      data: {},
      approvePrompt: false,
      rejectPrompt: false
    }
  }

  toggleRejectModal = () => {
    this.setState((state) => ({
      rejectPrompt: !state.rejectPrompt
    }))
  }

  toggleApproveModal = () => {
    this.setState((state) => ({
      approvePrompt: !state.approvePrompt
    }))
  }

  render() {
    const { intl, form } = this.props
    const { fields } = form
    if (
      this.props.declaration.registrationStatus !==
      SUBMISSION_STATUS.CORRECTION_REQUESTED
    )
      return null

    return (
      <>
        {this.props.children({
          toggleRejectModal: this.toggleRejectModal,
          toggleApproveModal: this.toggleApproveModal
        })}

        <ResponsiveModal
          id="save_correction_confirmation"
          title={intl.formatMessage(messages.saveCorrectionConfirmModalTitle)}
          show={this.state.approvePrompt}
          handleClose={this.toggleApproveModal}
          responsive={false}
          contentHeight={80}
          actions={[
            <TertiaryButton
              id="cancel_save"
              key="cancel_save"
              onClick={this.toggleApproveModal}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </TertiaryButton>,
            <SuccessButton id="confirm_save" key="confirm_save">
              {intl.formatMessage(buttonMessages.confirm)}
            </SuccessButton>
          ]}
        >
          {intl.formatMessage(messages.saveCorrectionConfirmModalDescription)}
        </ResponsiveModal>
        <ResponsiveModal
          id="reject_correction_confirmation"
          title={intl.formatMessage(messages.saveCorrectionRejectModalTitle)}
          show={this.state.rejectPrompt}
          width={718}
          contentHeight={230}
          handleClose={this.toggleRejectModal}
          showHeaderBorder={true}
          actions={[
            <TertiaryButton
              id="cancel_reject"
              key="cancel_reject"
              onClick={this.toggleRejectModal}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </TertiaryButton>,
            <DangerButton
              key="submit_reject_form"
              id="submit_reject_form"
              // disabled={!this.state.enableSendForUpdateBtn}
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </DangerButton>
          ]}
        >
          <Instruction>
            {intl.formatMessage(messages.saveCorrectionRejectModalDescription)}
          </Instruction>
          <FormFieldGenerator
            id="reject_form"
            fields={fields}
            onChange={() => {}}
            setAllFieldsDirty={false}
          />
        </ResponsiveModal>
      </>
    )
  }
}

export const ReviewSectionCorrection = connect<{}, DispatchProps>(
  () => ({
    form: rejectCorrection
  }),
  {
    writeDeclaration,
    goToHomeTab
  }
)(injectIntl<'intl', FullProps>(ReviewSectionCorrectionComp))
