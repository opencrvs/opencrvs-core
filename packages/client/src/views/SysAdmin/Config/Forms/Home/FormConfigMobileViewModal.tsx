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
import React from 'react'
import { useIntl } from 'react-intl'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { messages } from '@client/i18n/messages/views/formConfig'
import styled from '@client/styledComponents'

const Message = styled.div`
  margin-top: 36px;
`

export function FormConfigMobileViewModal({
  showModal,
  toggleModal
}: {
  showModal: boolean
  toggleModal: () => void
}) {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      show={showModal}
      title={intl.formatMessage(messages.formConfigMobileModalTitle)}
      handleClose={toggleModal}
      actions={[]}
    >
      <Message>
        {intl.formatMessage(messages.formConfigMobileModalDesc)}
      </Message>
    </ResponsiveModal>
  )
}
