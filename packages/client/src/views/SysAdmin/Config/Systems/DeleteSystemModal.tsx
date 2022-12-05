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
import {
  System,
  WebhookPermission,
  Event,
  SystemStatus
} from '@client/utils/gateway'
import {
  CheckboxGroup,
  Divider,
  FormTabs,
  ResponsiveModal
} from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import React, { useState } from 'react'

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
        contentHeight={50}
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
            type="primary"
            key="confirm"
            id="confirm"
            loading={loading}
            onClick={() => {
              deleteSystem()
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        show={true}
        handleClose={() => closeModal()}
      >
        {intl.formatMessage(integrationMessages.deleteSystemText)}
      </ResponsiveModal>
    </>
  )
}
