/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { useIntl } from 'react-intl'

import { buttonMessages } from '@client/i18n/messages'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { System } from '@client/utils/gateway'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { Button } from '@opencrvs/components/lib/Button'
import React, { ReactNode } from 'react'

interface ISystemProps {
  system: System
  loading: boolean
  closeModal: () => void
  deleteSystem: () => void
}

export function DeleteSystemModal({
  loading,
  system,
  closeModal,
  deleteSystem
}: ISystemProps) {
  const intl = useIntl()

  return (
    <>
      <Dialog
        title={system.name}
        supportingCopy={intl.formatMessage(
          integrationMessages.deleteSystemText,
          {
            b: (chunks: ReactNode) => <strong>{chunks}</strong>
          }
        )}
        actions={[
          <Button
            type="tertiary"
            id="cancel"
            key="cancel"
            onClick={() => {
              closeModal()
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="negative"
            key="delete"
            id="delete"
            loading={loading}
            onClick={() => {
              deleteSystem()
            }}
          >
            {intl.formatMessage(buttonMessages.delete)}
          </Button>
        ]}
        onOpen={true}
        onClose={() => closeModal()}
      />
    </>
  )
}
