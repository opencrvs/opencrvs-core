import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import styled from '@register/styledComponents'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  preview: {
    id: 'review.edit.modal.preview',
    defaultMessage: 'Back to Preview',
    description: 'Preview button on edit modal'
  },
  submitButton: {
    id: 'review.edit.modal.editButton',
    defaultMessage: 'Edit',
    description: 'Edit button on edit modal'
  },
  editApplicationConfirmationTxt: {
    id: 'review.edit.modal.confirmationText',
    defaultMessage: 'Are you sure you want to edit the application?',
    description: 'Edit modal confirmation text'
  }
})

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
      title={intl.formatMessage(messages.editApplicationConfirmationTxt)}
      actions={[
        <PrimaryButton key="edit" id="edit_confirm" onClick={handleEdit}>
          {intl.formatMessage(messages.submitButton)}
        </PrimaryButton>,
        <PreviewButton key="preview" id="preview_back" onClick={handleClose}>
          {intl.formatMessage(messages.preview)}
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
