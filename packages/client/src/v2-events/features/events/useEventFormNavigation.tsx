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
import { Button, ResponsiveModal, Stack, Text } from '@opencrvs/components'
import { defineMessages, useIntl } from 'react-intl'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@client/v2-events/routes'

const modalMessages = defineMessages({
  cancel: {
    id: 'exitModal.cancel',
    defaultMessage: 'Cancel'
  },
  confirm: {
    id: 'buttons.confirm',
    defaultMessage: 'Confirm'
  },
  exitWithoutSavingTitle: {
    id: 'exitModal.exitWithoutSaving',
    defaultMessage: 'Exit without saving changes?'
  },
  exitWithoutSavingDescription: {
    id: 'exitModal.exitWithoutSavingDescription',
    defaultMessage:
      'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?'
  }
})

export const useEventFormNavigation = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()

  const goToHome = () => {
    navigate(ROUTES.V2.path)
  }

  const exit = async () => {
    const exitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        responsive={false}
        title={intl.formatMessage(modalMessages.exitWithoutSavingTitle)}
        actions={[
          <Button
            type="tertiary"
            id="cancel_save_without_exit"
            key="cancel_save_without_exit"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(modalMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            key="confirm_save_without_exit"
            id="confirm_save_without_exit"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(modalMessages.confirm)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(null)}
      >
        <Stack>
          <Text variant="reg16" element="p" color="grey500">
            {intl.formatMessage(modalMessages.exitWithoutSavingDescription)}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (exitConfirm) {
      goToHome()
    }
  }

  return { exit, modal }
}
