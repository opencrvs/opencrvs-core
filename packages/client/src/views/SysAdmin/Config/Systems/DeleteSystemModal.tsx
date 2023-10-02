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
import { useIntl } from 'react-intl'

import { buttonMessages } from '@client/i18n/messages'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { System } from '@client/utils/gateway'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Button } from '@opencrvs/components/lib/Button'
import { Text } from '@opencrvs/components/lib/Text'
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
      <ResponsiveModal
        title={system.name}
        contentHeight={70}
        responsive={false}
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
        show={true}
        handleClose={() => closeModal()}
      >
        <Text variant="reg16" element="span">
          {intl.formatMessage(integrationMessages.deleteSystemText, {
            b: (chunks: ReactNode) => <strong>{chunks}</strong>
          })}
        </Text>
      </ResponsiveModal>
    </>
  )
}
