import * as React from 'react'
import styled from '../../styled-components'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const messages = defineMessages({
  preview: {
    id: 'register.form.modal.preview',
    defaultMessage: 'Preview',
    description: 'Preview button on submit modal'
  },
  submitDescription: {
    id: 'register.form.modal.submitDescription',
    defaultMessage:
      'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
    description: 'Submit description text on submit modal'
  },
  submitButton: {
    id: 'register.form.modal.submitButton',
    defaultMessage: 'Submit',
    description: 'Submit button on submit modal'
  }
})

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
`

interface IProps {
  showModal: boolean
  submitButtonId: string
  closeButtonId: string
  toggleModal: () => void
  mutationCall: () => void
}

function SubmitConfirmationComponent({
  intl,
  showModal,
  submitButtonId,
  closeButtonId,
  toggleModal,
  mutationCall
}: IProps & InjectedIntlProps) {
  return (
    <Modal
      title="Are you ready to submit?"
      actions={[
        <PrimaryButton
          key="submit"
          id={submitButtonId}
          onClick={() => mutationCall()}
        >
          {intl.formatMessage(messages.submitButton)}
        </PrimaryButton>,
        <PreviewButton
          id={closeButtonId}
          key="preview"
          onClick={() => {
            toggleModal()
            if (document.documentElement) {
              document.documentElement.scrollTop = 0
            }
          }}
        >
          {intl.formatMessage(messages.preview)}
        </PreviewButton>
      ]}
      show={showModal}
      handleClose={toggleModal}
    >
      {intl.formatMessage(messages.submitDescription)}
    </Modal>
  )
}

export const SubmitConfirmation = injectIntl(SubmitConfirmationComponent)
