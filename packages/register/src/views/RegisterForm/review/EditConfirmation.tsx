import * as React from 'react'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import styled from '@register/styledComponents'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@register/i18n/messages/views/review'
import { buttonMessages } from '@register/i18n/messages'

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`

interface IProps {
  show: boolean
  handleEdit: () => void
  handleClose: () => void
}

const EditConfirmationComponent = ({
  show,
  handleEdit,
  handleClose,
  intl
}: IProps & InjectedIntlProps) => {
  return (
    <Modal
      title={intl.formatMessage(messages.editApplicationConfirmation)}
      actions={[
        <PrimaryButton key="edit" id="edit_confirm" onClick={handleEdit}>
          {intl.formatMessage(buttonMessages.edit)}
        </PrimaryButton>,
        <PreviewButton key="preview" id="preview_back" onClick={handleClose}>
          {intl.formatMessage(messages.backToPreview)}
        </PreviewButton>
      ]}
      show={show}
      handleClose={handleClose}
    >
      <></>
    </Modal>
  )
}

export const EditConfirmation = injectIntl(EditConfirmationComponent)
