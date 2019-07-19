import * as React from 'react'
import styled from '@register/styledComponents'
import { PrimaryButton, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { Upload, TickLarge, CrossLarge } from '@opencrvs/components/lib/icons'

interface IReviewActionProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  isComplete: boolean
  hasRegisterScope?: boolean
  isRejected?: boolean
  submitAction?: () => void
  registerAction?: () => void
  rejectAction?: () => void
}

const Container = styled.div`
  position: relative;
`
const Content = styled.div`
  z-index: 1;
  padding: 24px 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
`
const UnderLayBackground = styled.div.attrs<{ isComplete: boolean }>({})`
  background-color: ${({ isComplete, theme }) =>
    isComplete ? theme.colors.success : theme.colors.error};
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
      'By sending this incomplete application, there will be a digital record made.\n\nTell the applicant that they will receive an SMS with a tracking ID. They will need this to complete the application at a registration office within 30 days. The applicant will need to provide all mandatory information before the birth can be registered',
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
  }
})

const RejectApplication = styled(PrimaryButton)`
  background-color: ${({ theme }) => theme.colors.error};
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.error};
  }
`
export const ReviewAction = injectIntl(
  (props: IReviewActionProps & InjectedIntlProps) => {
    const {
      id,
      hasRegisterScope,
      isComplete,
      isRejected,
      submitAction,
      registerAction,
      rejectAction,
      intl
    } = props

    return (
      <Container id={id}>
        <UnderLayBackground isComplete={isComplete} />
        <Content>
          <Title>
            {intl.formatMessage(messages.reviewActionTitle, { isComplete })}
          </Title>
          <Description>
            {intl.formatMessage(
              isComplete
                ? messages.reviewActionDescriptionComplete
                : messages.reviewActionDescriptionIncomplete
            )}
          </Description>
          <ActionContainer>
            {registerAction && (
              <PrimaryButton
                id="registerApplicationBtn"
                icon={() => <TickLarge />}
                onClick={registerAction}
                disabled={!isComplete}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(messages.valueRegister)}
              </PrimaryButton>
            )}

            {submitAction && (
              <PrimaryButton
                id="submit_form"
                icon={() => <Upload />}
                onClick={submitAction}
                disabled={false}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(
                  hasRegisterScope
                    ? messages.valueRegister
                    : isComplete
                    ? messages.valueSendForReview
                    : messages.valueSendForReviewIncomplete
                )}
              </PrimaryButton>
            )}

            {rejectAction && !isRejected && (
              <RejectApplication
                id="rejectApplicationBtn"
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <CrossLarge />}
                onClick={rejectAction}
              >
                {intl.formatMessage(messages.valueReject)}
              </RejectApplication>
            )}
          </ActionContainer>
        </Content>
      </Container>
    )
  }
)
