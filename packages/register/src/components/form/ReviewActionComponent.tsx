import * as React from 'react'
import styled from '@register/styledComponents'
import {
  PrimaryButton,
  ICON_ALIGNMENT,
  SuccessButton,
  DangerButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { Upload, Check, Cross } from '@opencrvs/components/lib/icons'
import {
  SUBMISSION_STATUS,
  IApplication,
  IPayload
} from '@register/applications'

import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { Action } from '@register/forms'

interface IReviewActionProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  isComplete: boolean
  isRegister?: boolean
  isDraft?: boolean
  isRejected: boolean
  application: IApplication
  submitAction: (
    application: IApplication,
    submissionStatus: string,
    action: string,
    payload?: IPayload
  ) => void
  rejectAction?: () => void
}

const Container = styled.div`
  position: relative;
  margin: 0 32px 32px;
`
const Content = styled.div`
  z-index: 1;
  padding: 24px 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
`
const UnderLayBackground = styled.div.attrs<{ background: string }>({})`
  background-color: ${({ background, theme }) =>
    background === 'success'
      ? theme.colors.success
      : background === 'error'
      ? theme.colors.error
      : theme.colors.primary};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.16;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle}
  margin-bottom: 8px;
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin-bottom: 16px;
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  button:first-child {
    margin-right: 16px;
  }
`
const messages = defineMessages({
  reviewActionTitle: {
    id: 'review.actions.title.applicationStatus',
    defaultMessage:
      'Application is {isComplete, select, true {complete} false {incomplete}}',
    description: 'Title for review action component'
  },
  reviewActionDescriptionIncomplete: {
    id: 'review.actions.description.confirmInComplete',
    defaultMessage:
      'By sending this incomplete application, there will be a digital record made.\n\nTell the applicant that they will receive an SMS with a tracking ID. They will need this to complete the application at a registration office within 30 days. The applicant will need to provide all mandatory information before the birth can be registered.',
    description:
      'Description for review action component when incomplete application'
  },
  reviewActionDescriptionComplete: {
    id: 'review.actions.description.confirmComplete',
    defaultMessage:
      'By sending this application for review, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.',
    description:
      'Description for review action component when complete application'
  },
  registerActionDescriptionIncomplete: {
    id: 'register.actions.description.confirmInComplete',
    defaultMessage:
      'Mandatory information is missing. Please add this information so that you can complete the registration process.'
  },
  registerActionDescriptionComplete: {
    id: 'register.actions.description.confirmComplete',
    defaultMessage:
      'By clicking register, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.\n\nBy registering this birth, a birth certificate will be generated with your signature for issuance.'
  },
  registerActionTitle: {
    id: 'register.actions.title.applicationStatus',
    defaultMessage: 'Register or reject?'
  },
  registerActionDescription: {
    id: 'register.actions.description',
    defaultMessage:
      'By registering this birth, a birth certificate will be generated with your signature for issuance.'
  },
  valueSendForReview: {
    id: 'buttons.sendForReview',
    defaultMessage: 'SEND FOR REVIEW',
    description: 'Submit Button Text'
  },
  valueSendForReviewIncomplete: {
    id: 'buttons.sendIncomplete',
    defaultMessage: 'Send incomplete application',
    description: 'Title for Incomplete submit button'
  },
  valueRegister: {
    id: 'buttons.register',
    defaultMessage: 'REGISTER',
    description: 'Register button text'
  },
  valueReject: {
    id: 'buttons.reject',
    defaultMessage: 'Reject Application',
    description: 'Reject application button text'
  },
  submitConfirmationTitle: {
    id: 'register.form.modal.title.submitConfirmation',
    defaultMessage:
      '{isComplete, select, true {Send application for review?} false {Send incomplete application?}}',
    description: 'Submit title text on modal'
  },
  submitConfirmationDesc: {
    id: 'register.form.modal.desc.submitConfirmation',
    defaultMessage:
      '{isComplete, select, true {This application will be sent to the registrar for them to review.} false {This application will be sent to the register who is now required to complete the application.}}',
    description: 'Submit description text on modal'
  },
  registerConfirmationTitle: {
    id: 'register.form.modal.title.registerConfirmation',
    defaultMessage: 'Register this application?',
    description: 'Title for register confirmation modal'
  },
  registerConfirmationDesc: {
    id: 'register.form.modal.desc.registerConfirmation',
    defaultMessage: 'Are you sure?',
    description: 'Description for register confirmation modal'
  },
  registerButtonTitle: {
    id: 'register.form.modal.button.title.registerConfirmation',
    defaultMessage: 'Register',
    description: 'Label for button on register confirmation modal'
  },
  submitButton: {
    id: 'register.form.modal.submitButton',
    defaultMessage: 'Send',
    description: 'Submit button on submit modal'
  },
  cancel: {
    id: 'buttons.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button on submit modal'
  }
})

interface IReviewActionState {
  showSubmitModal: boolean
}
class ReviewActionComponent extends React.Component<
  IReviewActionProps & InjectedIntlProps,
  IReviewActionState
> {
  state = { showSubmitModal: false }
  toggleSubmitModalOpen = () => {
    this.setState(prevState => ({
      showSubmitModal: !prevState.showSubmitModal
    }))
  }
  render() {
    const {
      id,
      isRegister,
      isRejected,
      isComplete,
      application,
      submitAction,
      isDraft,
      rejectAction,
      intl
    } = this.props

    const background = !isComplete ? 'error' : isDraft ? 'success' : ''
    return (
      <Container id={id}>
        <UnderLayBackground background={background} />
        <Content>
          <Title>
            {isRegister && isComplete && !isDraft
              ? intl.formatMessage(messages.registerActionTitle)
              : intl.formatMessage(messages.reviewActionTitle, { isComplete })}
          </Title>
          <Description>
            {!isRegister &&
              intl.formatMessage(
                isComplete
                  ? messages.reviewActionDescriptionComplete
                  : messages.reviewActionDescriptionIncomplete
              )}
            {isRegister &&
              intl.formatMessage(
                isComplete
                  ? !isDraft
                    ? messages.registerActionDescription
                    : messages.registerActionDescriptionComplete
                  : messages.registerActionDescriptionIncomplete
              )}
          </Description>
          <ActionContainer>
            {!isRegister && (
              <PrimaryButton
                id="submit_form"
                icon={() => <Upload />}
                onClick={this.toggleSubmitModalOpen}
                disabled={false}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(
                  isComplete
                    ? messages.valueSendForReview
                    : messages.valueSendForReviewIncomplete
                )}
              </PrimaryButton>
            )}

            {isRegister && (
              <SuccessButton
                id="registerApplicationBtn"
                icon={() => <Check />}
                onClick={this.toggleSubmitModalOpen}
                disabled={!isComplete}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(messages.valueRegister)}
              </SuccessButton>
            )}

            {rejectAction && !isRejected && (
              <DangerButton
                id="rejectApplicationBtn"
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <Cross color="white" />}
                onClick={rejectAction}
              >
                {intl.formatMessage(messages.valueReject)}
              </DangerButton>
            )}
          </ActionContainer>
        </Content>
        <ResponsiveModal
          title={
            isRegister
              ? intl.formatMessage(messages.registerConfirmationTitle)
              : intl.formatMessage(messages.submitConfirmationTitle, {
                  isComplete
                })
          }
          contentHeight={96}
          actions={[
            <TertiaryButton
              id="cancel-btn"
              key="cancel"
              onClick={() => {
                this.toggleSubmitModalOpen()
                if (document.documentElement) {
                  document.documentElement.scrollTop = 0
                }
              }}
            >
              {intl.formatMessage(messages.cancel)}
            </TertiaryButton>,
            <PrimaryButton
              key="submit"
              id="submit_confirm"
              onClick={() =>
                isDraft
                  ? submitAction(
                      application,
                      SUBMISSION_STATUS.READY_TO_SUBMIT,
                      Action.SUBMIT_FOR_REVIEW
                    )
                  : submitAction(
                      application,
                      SUBMISSION_STATUS.READY_TO_REGISTER,
                      Action.REGISTER_APPLICATION
                    )
              }
            >
              {isRegister
                ? intl.formatMessage(messages.registerButtonTitle)
                : intl.formatMessage(messages.submitButton)}
            </PrimaryButton>
          ]}
          show={this.state.showSubmitModal}
          handleClose={this.toggleSubmitModalOpen}
        >
          {isRegister
            ? intl.formatMessage(messages.registerConfirmationDesc)
            : intl.formatMessage(messages.submitConfirmationDesc, {
                isComplete
              })}
        </ResponsiveModal>
      </Container>
    )
  }
}

export const ReviewAction = injectIntl(ReviewActionComponent)
