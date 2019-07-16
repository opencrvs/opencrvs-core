import * as React from 'react'
import styled from '@register/styledComponents'
import {
  PrimaryButton,
  ICON_ALIGNMENT,
  SuccessButton,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { Upload, Check, Cross } from '@opencrvs/components/lib/icons'
import { SUBMISSION_STATUS } from '@register/applications'
import { REJECTED } from '@register/utils/constants'

interface IReviewActionProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  isComplete: boolean
  hasRegisterScope?: boolean
  registrationStatus?: string
  submissionStatus?: string
  submitAction?: () => void
  registerAction?: () => void
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
    id: 'register.form.submit',
    defaultMessage: 'SEND FOR REVIEW',
    description: 'Submit Button Text'
  },
  valueSendForReviewIncomplete: {
    id: 'register.form.submitIncomplete',
    defaultMessage: 'Send incomplete application',
    description: 'Title for Incomplete submit button'
  },
  valueRegister: {
    id: 'review.button.register',
    defaultMessage: 'REGISTER',
    description: 'Register button text'
  },
  valueReject: {
    id: 'review.button.reject',
    defaultMessage: 'Reject Application',
    description: 'Reject application button text'
  }
})

export const ReviewAction = injectIntl(
  (props: IReviewActionProps & InjectedIntlProps) => {
    const {
      id,
      hasRegisterScope,
      isComplete,
      registrationStatus,
      submissionStatus,
      submitAction,
      registerAction,
      rejectAction,
      intl
    } = props

    const background = !isComplete
      ? 'error'
      : submissionStatus === SUBMISSION_STATUS.DRAFT
      ? 'success'
      : ''
    return (
      <Container id={id}>
        <UnderLayBackground background={background} />
        <Content>
          <Title>
            {hasRegisterScope &&
            isComplete &&
            submissionStatus !== SUBMISSION_STATUS.DRAFT
              ? intl.formatMessage(messages.registerActionTitle)
              : intl.formatMessage(messages.reviewActionTitle, { isComplete })}
          </Title>
          <Description>
            {!hasRegisterScope &&
              intl.formatMessage(
                isComplete
                  ? messages.reviewActionDescriptionComplete
                  : messages.reviewActionDescriptionIncomplete
              )}
            {hasRegisterScope &&
              intl.formatMessage(
                isComplete
                  ? submissionStatus !== SUBMISSION_STATUS.DRAFT
                    ? messages.registerActionDescription
                    : messages.registerActionDescriptionComplete
                  : messages.registerActionDescriptionIncomplete
              )}
          </Description>
          <ActionContainer>
            {submitAction && !hasRegisterScope && (
              <PrimaryButton
                id="submit_form"
                icon={() => <Upload />}
                onClick={submitAction}
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

            {submitAction && hasRegisterScope && (
              <SuccessButton
                id="submit_form"
                icon={() => <Check />}
                onClick={submitAction}
                disabled={!isComplete}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(messages.valueRegister)}
              </SuccessButton>
            )}

            {registerAction && (
              <SuccessButton
                id="registerApplicationBtn"
                icon={() => <Check />}
                onClick={registerAction}
                disabled={!isComplete}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(messages.valueRegister)}
              </SuccessButton>
            )}

            {rejectAction && registrationStatus !== REJECTED && isComplete && (
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
      </Container>
    )
  }
)
