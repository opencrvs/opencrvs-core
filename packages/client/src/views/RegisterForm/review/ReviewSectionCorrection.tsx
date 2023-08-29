import {
  IDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { FormFieldGenerator } from '@client/components/form'
import { Button } from '@opencrvs/components/lib/Button'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import { Text } from '@opencrvs/components/lib/Text'
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

    return (
      <>
        {this.props.children({
          toggleRejectModal: this.toggleRejectModal,
          toggleApproveModal: this.toggleApproveModal
        })}

        <Dialog
          id="save_correction_confirmation"
          title={intl.formatMessage(messages.saveCorrectionConfirmModalTitle)}
          isOpen={this.state.approvePrompt}
          onClose={this.toggleApproveModal}
          actions={[
            <Button
              type="tertiary"
              size="medium"
              id="cancel_save"
              key="cancel_save"
              onClick={this.toggleApproveModal}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="positive"
              size="medium"
              id="confirm_save"
              key="confirm_save"
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </Button>
          ]}
        >
          <Text element="p" variant="reg16">
            {intl.formatMessage(messages.saveCorrectionConfirmModalDescription)}
          </Text>
        </Dialog>
        <Dialog
          id="reject_correction_confirmation"
          title={intl.formatMessage(messages.saveCorrectionRejectModalTitle)}
          isOpen={this.state.rejectPrompt}
          onClose={this.toggleRejectModal}
          actions={[
            <Button
              type="tertiary"
              size="medium"
              id="cancel_reject"
              key="cancel_reject"
              onClick={this.toggleRejectModal}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="negative"
              size="medium"
              key="submit_reject_form"
              id="submit_reject_form"
              // disabled={!this.state.enableSendForUpdateBtn}
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </Button>
          ]}
        >
          <Text element="p" variant="reg16">
            <Instruction>
              {intl.formatMessage(
                messages.saveCorrectionRejectModalDescription
              )}
            </Instruction>
          </Text>
          <FormFieldGenerator
            id="reject_form"
            fields={fields}
            onChange={() => {}}
            setAllFieldsDirty={false}
          />
        </Dialog>
      </>
    )
  }
}

export const ReviewSectionCorrection = connect<{}, DispatchProps>(null, {
  writeDeclaration,
  goToHomeTab
})(injectIntl<'intl', FullProps>(ReviewSectionCorrectionComp))
