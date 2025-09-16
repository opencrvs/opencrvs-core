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
import { useIntl } from 'react-intl'
import { ResponsiveModal } from '@opencrvs/components'
import { DangerButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { getUUID } from '@opencrvs/commons/client'
import { useEvents } from '../features/events/useEvents/useEvents'
import { useModal } from './useModal'

const archiveMessages = {
  confirmationBody: {
    id: 'recordAudit.archive.confirmation.body',
    defaultMessage:
      'This will remove the declaration from the workqueue and change the status to Archive. To revert this change you will need to search for the declaration.',
    description: 'Confirmation body for archiving a declaration'
  },
  confirmationTitle: {
    id: 'recordAudit.archive.confirmation.title',
    defaultMessage: 'Archive declaration?',
    description: 'Confirmation title for archiving a declaration'
  },
  archive: {
    id: 'buttons.archive',
    defaultMessage: 'Archive',
    description: 'Archive button text'
  },
  cancel: {
    id: 'buttons.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button text'
  }
}

function ArchiveModal({ close }: { close: (result: boolean) => void }) {
  const intl = useIntl()

  return (
    <ResponsiveModal
      actions={[
        <TertiaryButton
          key="cancel"
          id="cancel-btn"
          onClick={() => close(false)}
        >
          {intl.formatMessage(archiveMessages.cancel)}
        </TertiaryButton>,

        <DangerButton
          key="archive_confirm"
          id="archive_confirm"
          size={'medium'}
          onClick={() => close(true)}
        >
          {intl.formatMessage(archiveMessages.archive)}
        </DangerButton>
      ]}
      contentHeight={96}
      handleClose={() => close(false)}
      responsive={false}
      show={true}
      title={intl.formatMessage(archiveMessages.confirmationTitle)}
    >
      {intl.formatMessage(archiveMessages.confirmationBody)}
    </ResponsiveModal>
  )
}

export function useArchiveModal() {
  const [modal, openModal] = useModal()
  const { actions } = useEvents()

  const onArchive = async (eventId: string) => {
    const archive = await openModal<boolean>((close) => (
      <ArchiveModal close={close} />
    ))
    if (archive) {
      actions.archive.mutate({
        eventId,
        transactionId: getUUID(),
        content: {
          reason: 'Archived from action menu'
        }
      })
    }
  }
  return { onArchive, archiveModal: modal }
}
