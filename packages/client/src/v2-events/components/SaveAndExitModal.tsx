import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Button } from '@opencrvs/components/lib/Button'
import { Stack, Text } from '@opencrvs/components'
import { useModal } from '@client/v2-events/hooks/useModal'

const saveAndExitModalMessages = defineMessages({
  saveDeclarationConfirmModalTitle: {
    id: 'v2.saveAndExit.title.saveDeclarationConfirm',
    defaultMessage: 'Save & exit?',
    description: 'Title for save declaration confirmation modal'
  },
  saveDeclarationConfirmModalDescription: {
    id: 'v2.saveAndExit.desc.saveDeclarationConfirm',
    defaultMessage:
      'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?',
    description: 'Description for save declaration confirmation modal'
  },
  cancel: {
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal',
    id: 'v2.buttons.cancel'
  },
  confirm: {
    defaultMessage: 'Confirm',
    description: 'Confirm button text',
    id: 'v2.buttons.confirm'
  }
})

export function useSaveAndExitModal() {
  const [saveAndExitModal, openModal] = useModal()
  const intl = useIntl()

  async function handleSaveAndExit(onSaveAndExit: () => void) {
    const saveAndExitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        actions={[
          <Button
            key="cancel_save_exit"
            id="cancel_save_exit"
            type="tertiary"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(saveAndExitModalMessages.cancel)}
          </Button>,
          <Button
            key="confirm_save_exit"
            id="confirm_save_exit"
            type="positive"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(saveAndExitModalMessages.confirm)}
          </Button>
        ]}
        handleClose={() => close(null)}
        id="save_declaration_confirmation"
        responsive={false}
        show={true}
        title={intl.formatMessage(
          saveAndExitModalMessages.saveDeclarationConfirmModalTitle
        )}
      >
        <Stack>
          <Text color="grey500" element="p" variant="reg16">
            {intl.formatMessage(
              saveAndExitModalMessages.saveDeclarationConfirmModalDescription
            )}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (saveAndExitConfirm) {
      onSaveAndExit()
    }
    return
  }
  return { saveAndExitModal, handleSaveAndExit }
}
