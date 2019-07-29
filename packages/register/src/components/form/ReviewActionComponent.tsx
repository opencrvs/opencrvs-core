import * as React from 'react'
import styled from '@register/styledComponents'
import {
  PrimaryButton,
  ICON_ALIGNMENT,
  SuccessButton,
  DangerButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { Upload, Check, Cross } from '@opencrvs/components/lib/icons'
import {
  SUBMISSION_STATUS,
  IApplication,
  IPayload
} from '@register/applications'
import { messages } from '@register/i18n/messages/views/review'
import { buttonMessages, constantsMessages } from '@register/i18n/messages'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { Action } from '@register/forms'

interface IReviewActionProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  isComplete: boolean
  isRegister?: boolean
  isRegistrationAgent?: boolean
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
  margin-top: 32px;
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
      isRegistrationAgent,
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
              !isRegistrationAgent &&
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
            {isRegistrationAgent &&
              intl.formatMessage(messages.validateActionDescription, {
                isComplete
              })}
          </Description>
          <ActionContainer>
            {!isRegister && !isRegistrationAgent && (
              <PrimaryButton
                id="submit_form"
                icon={() => <Upload />}
                onClick={this.toggleSubmitModalOpen}
                disabled={false}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(
                  isComplete
                    ? buttonMessages.sendForReview
                    : buttonMessages.sendIncomplete
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
                {intl.formatMessage(buttonMessages.register)}
              </SuccessButton>
            )}

            {isRegistrationAgent && (
              <PrimaryButton
                id="validateApplicationBtn"
                icon={() => <Upload />}
                onClick={this.toggleSubmitModalOpen}
                disabled={!isComplete}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(messages.valueApprove)}
              </PrimaryButton>
            )}

            {rejectAction && !isRejected && (
              <DangerButton
                id="rejectApplicationBtn"
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <Cross color="white" />}
                onClick={rejectAction}
              >
                {intl.formatMessage(buttonMessages.reject)}
              </DangerButton>
            )}
          </ActionContainer>
        </Content>
        <ResponsiveModal
          title={
            isRegister
              ? intl.formatMessage(messages.registerConfirmationTitle)
              : isRegistrationAgent
              ? intl.formatMessage(messages.validateConfirmationTitle)
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
              {intl.formatMessage(buttonMessages.cancel)}
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
                ? intl.formatMessage(buttonMessages.register)
                : intl.formatMessage(buttonMessages.send)}
            </PrimaryButton>
          ]}
          show={this.state.showSubmitModal}
          handleClose={this.toggleSubmitModalOpen}
        >
          {isRegister
            ? intl.formatMessage(constantsMessages.areYouSure)
            : isRegistrationAgent
            ? intl.formatMessage(messages.validateConfirmationDesc)
            : intl.formatMessage(messages.submitConfirmationDesc, {
                isComplete
              })}
        </ResponsiveModal>
      </Container>
    )
  }
}

export const ReviewAction = injectIntl(ReviewActionComponent)
