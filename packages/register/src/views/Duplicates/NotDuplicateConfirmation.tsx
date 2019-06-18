import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import styled from '@register/styledComponents'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const ConfirmButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`
const StyledModal = styled(Modal)`
  z-index: 4;
`
export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  noButton: {
    id: 'register.duplicates.notDuplicate.modal.back',
    defaultMessage: 'Back',
    description: 'Back button text on not a duplicate confirmation modal'
  },
  yesButton: {
    id: 'register.duplicates.notDuplicate.modal.yes',
    defaultMessage: 'Yes',
    description: 'Yes button on not a duplicate confirmation modal'
  },
  notDuplicateConfirmationTxt: {
    id: 'register.duplicates.notDuplicate.modal.confirmationText',
    defaultMessage: 'Are you sure this is not a duplicate application?',
    description: 'Not a duplicate modal confirmation text'
  }
})

interface IProps {
  show: boolean
  handleYes: () => void
  handleClose: () => void
}

const NotDuplicateConfirmationComponent = ({
  show,
  handleYes,
  handleClose,
  intl
}: IProps & InjectedIntlProps) => {
  return (
    <StyledModal
      title={intl.formatMessage(messages.notDuplicateConfirmationTxt)}
      actions={[
        <PrimaryButton
          key="confirm"
          id="not_duplicate_confirm"
          onClick={handleYes}
        >
          {intl.formatMessage(messages.yesButton)}
        </PrimaryButton>,
        <ConfirmButton
          key="close"
          id="not_duplicate_close"
          onClick={handleClose}
        >
          {intl.formatMessage(messages.noButton)}
        </ConfirmButton>
      ]}
      show={show}
      handleClose={handleClose}
    >
      <></>
    </StyledModal>
  )
}

export const NotDuplicateConfirmation = injectIntl(
  NotDuplicateConfirmationComponent
)
