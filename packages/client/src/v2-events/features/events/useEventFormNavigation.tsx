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
import { useNavigate } from 'react-router-dom'
import { Button, ResponsiveModal, Stack, Text } from '@opencrvs/components'
import { useModal } from '@client/v2-events/hooks/useModal'
import { ROUTES } from '@client/v2-events/routes'
import { removeEventFromStorage, useEvents } from './useEvents/useEvents'

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
  },
  deleteDeclarationTitle: {
    id: 'register.form.modal.title.deleteDeclarationConfirm',
    defaultMessage: 'Delete draft?',
    description: 'Title for delete declaration confirmation modal'
  },
  deleteDeclarationDescription: {
    id: 'register.form.modal.desc.deleteDeclarationConfirm',
    defaultMessage: `Are you certain you want to delete this draft declaration form? Please note, this action can't be undone.`,
    description: 'Description for delete declaration confirmation modal'
  }
})

export function useEventFormNavigation() {
  const intl = useIntl()
  const navigate = useNavigate()

  const events = useEvents()
  const deleteEvent = events.deleteEvent()

  const [modal, openModal] = useModal()

  function goToHome() {
    navigate(ROUTES.V2.path)
  }

  function goToReview(eventId: string) {
    navigate(ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({ eventId }))
  }

  async function exit(eventId: string) {
    const exitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        actions={[
          <Button
            key="cancel_save_without_exit"
            id="cancel_save_without_exit"
            type="tertiary"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(modalMessages.cancel)}
          </Button>,
          <Button
            key="confirm_save_without_exit"
            id="confirm_save_without_exit"
            type="primary"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(modalMessages.confirm)}
          </Button>
        ]}
        handleClose={() => close(null)}
        responsive={false}
        show={true}
        title={intl.formatMessage(modalMessages.exitWithoutSavingTitle)}
      >
        <Stack>
          <Text color="grey500" element="p" variant="reg16">
            {intl.formatMessage(modalMessages.exitWithoutSavingDescription)}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (exitConfirm) {
      deleteEvent.mutate(eventId, {
        onSuccess: async (data: { id: string }) => {
          await removeEventFromStorage(data.id)
          goToHome()
        },
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to delete event', error)
        }
      })
    }
  }

  async function deleteDeclaration(eventId: string) {
    const deleteConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        actions={[
          <Button
            key="cancel_delete"
            id="cancel_delete"
            type="tertiary"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(modalMessages.cancel)}
          </Button>,
          <Button
            key="confirm_delete"
            id="confirm_delete"
            type="primary"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(modalMessages.confirm)}
          </Button>
        ]}
        handleClose={() => close(null)}
        responsive={false}
        show={true}
        title={intl.formatMessage(modalMessages.deleteDeclarationTitle)}
      >
        <Stack>
          <Text color="grey500" element="p" variant="reg16">
            {intl.formatMessage(modalMessages.deleteDeclarationDescription)}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (deleteConfirm) {
      deleteEvent.mutate(eventId, {
        onSuccess: async (data: { id: string }) => {
          await removeEventFromStorage(data.id)
          goToHome()
        },
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to delete event', error)
        }
      })
    }
  }

  return { exit, modal, goToHome, goToReview, deleteDeclaration }
}
