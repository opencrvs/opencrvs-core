/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Button } from '@opencrvs/components/lib/Button'
import { Stack, Text } from '@opencrvs/components'
import { useModal } from '@client/v2-events/hooks/useModal'

const clearFormModalMessages = defineMessages({
  clearFormConfirmModalTitle: {
    id: 'clearForm.title.clearFormConfirm',
    defaultMessage: 'Clear form?',
    description: 'Title for clear form confirmation modal'
  },
  clearFormConfirmModalDescription: {
    id: 'clearForm.desc.clearFormConfirm',
    defaultMessage:
      'All fields on this page will be cleared. Are you sure you want to continue?',
    description: 'Description for clear form confirmation modal'
  },
  cancel: {
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal',
    id: 'buttons.cancel'
  },
  clear: {
    defaultMessage: 'Clear',
    description: 'Clear button text in the modal',
    id: 'buttons.clear'
  }
})

export function useClearFormModal() {
  const [clearFormModal, openModal] = useModal()
  const intl = useIntl()

  async function openClearFormConfirmation(): Promise<boolean> {
    const confirmed = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        actions={[
          <Button
            key="cancel_clear_form"
            id="cancel_clear_form"
            type="tertiary"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(clearFormModalMessages.cancel)}
          </Button>,
          <Button
            key="confirm_clear_form"
            id="confirm_clear_form"
            type="negative"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(clearFormModalMessages.clear)}
          </Button>
        ]}
        handleClose={() => close(null)}
        id="clear_form_confirmation"
        responsive={false}
        show={true}
        title={intl.formatMessage(
          clearFormModalMessages.clearFormConfirmModalTitle
        )}
      >
        <Stack>
          <Text color="grey500" element="p" variant="reg16">
            {intl.formatMessage(
              clearFormModalMessages.clearFormConfirmModalDescription
            )}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    return Boolean(confirmed)
  }

  return { clearFormModal, openClearFormConfirmation }
}
