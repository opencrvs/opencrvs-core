import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import styled from 'styledComponents'
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
export const messages = defineMessages({
  noButton: {
    id: 'app.logout.modal.no',
    defaultMessage: 'No',
    description: 'No button text on logout modal'
  },
  yesButton: {
    id: 'app.logout.modal.yes',
    defaultMessage: 'Yes',
    description: 'Yes button on logout modal'
  },
  editApplicationConfirmationTxt: {
    id: 'app.logout.modal.confirmationText',
    defaultMessage: 'Are you sure you wish to log out?',
    description: 'Logout modal confirmation text'
  }
})

interface IProps {
  show: boolean
  handleYes: () => void
  handleClose: () => void
}

const LogoutConfirmationComponent = ({
  show,
  handleYes,
  handleClose,
  intl
}: IProps & InjectedIntlProps) => {
  return (
    <StyledModal
      title={intl.formatMessage(messages.editApplicationConfirmationTxt)}
      actions={[
        <PrimaryButton key="confirm" id="logout_confirm" onClick={handleYes}>
          {intl.formatMessage(messages.yesButton)}
        </PrimaryButton>,
        <ConfirmButton key="close" id="logout_close" onClick={handleClose}>
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

export const LogoutConfirmation = injectIntl(LogoutConfirmationComponent)
