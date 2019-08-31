import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from '@register/styledComponents'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@register/i18n/messages/views/duplicates'
import { buttonMessages } from '@register/i18n/messages'

const ConfirmButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`
const StyledModal = styled(Modal)`
  z-index: 4;
`

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
}: IProps & IntlShapeProps) => {
  return (
    <StyledModal
      title={intl.formatMessage(messages.notDuplicateConfirmationTxt)}
      actions={[
        <PrimaryButton
          key="confirm"
          id="not_duplicate_confirm"
          onClick={handleYes}
        >
          {intl.formatMessage(buttonMessages.yes)}
        </PrimaryButton>,
        <ConfirmButton
          key="close"
          id="not_duplicate_close"
          onClick={handleClose}
        >
          {intl.formatMessage(buttonMessages.back)}
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
