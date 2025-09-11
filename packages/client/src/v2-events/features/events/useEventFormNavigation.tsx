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
import { EventIndex, isUndeclaredDraft } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEvents } from './useEvents/useEvents'
import { useEventFormData } from './useEventFormData'
import { useActionAnnotation } from './useActionAnnotation'

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
    id: 'register.form.modal.description.deleteDeclarationConfirm',
    defaultMessage: `Are you certain you want to delete this draft declaration form? Please note, this action can't be undone.`,
    description: 'Description for delete declaration confirmation modal'
  }
})

export function useEventFormNavigation() {
  const intl = useIntl()
  const navigate = useNavigate()

  const events = useEvents()
  const { getAllRemoteDrafts } = useDrafts()
  const remoteDrafts = getAllRemoteDrafts()
  const deleteEvent = events.deleteEvent.useMutation()

  const { setLocalDraft } = useDrafts()
  const clearForm = useEventFormData((state) => state.clear)
  const clearAnnotation = useActionAnnotation((state) => state.clear)

  const [modal, openModal] = useModal()

  function goToHome() {
    navigate(ROUTES.V2.path)
  }

  function goToWorkqueue(slug: string) {
    navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug }))
  }

  function clearEphemeralFormState() {
    setLocalDraft(null)
    clearForm()
    clearAnnotation()
  }

  function createNewDeclaration() {
    clearEphemeralFormState()
    navigate(ROUTES.V2.EVENTS.CREATE.path)
  }

  /**
   * Accepts an optional workqueue slug to navigate to after closing the view.
   *
   * DO NOT pass this function directly to `onClick` handlers like `onClick={closeActionView}`
   * because React will inject a MouseEvent as the first argument.
   *
   * Always wrap in an arrow function instead: `onClick={() => closeActionView()}`
   *
   * If you have a `string | undefined` (e.g. `slug`), you can pass it directly:
   * `closeActionView(slug)`
   */
  function closeActionView(workqueueToGoBackTo?: string) {
    workqueueToGoBackTo ? goToWorkqueue(workqueueToGoBackTo) : goToHome()
    clearEphemeralFormState()
  }

  async function exit(event: EventIndex) {
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

    if (!exitConfirm) {
      return
    }
    const hasDrafts = remoteDrafts.find((draft) => draft.eventId === event.id)
    if (isUndeclaredDraft(event.status) && !hasDrafts) {
      deleteEvent.mutate({ eventId: event.id })
    }

    closeActionView()
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
      deleteEvent.mutate({ eventId })
      closeActionView()
    }
  }

  return {
    exit,
    modal,
    createNewDeclaration,
    deleteDeclaration,
    closeActionView,
    clearEphemeralFormState
  }
}
