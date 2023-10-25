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
import * as React from 'react'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton
} from '@client/views/Settings/items/components'
import {
  constantsMessages,
  buttonMessages,
  userMessages
} from '@client/i18n/messages'
import { PasswordChangeModal } from '@client/views/Settings/PasswordChangeModal'
import { useOnlineStatus } from '@client/utils'

export function Password() {
  const intl = useIntl()
  const isOnline = useOnlineStatus()
  const [showModal, setShowModal] = React.useState(false)
  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState(false)

  const togglePasswordChangeModal = () => {
    setShowModal((prevValue) => !prevValue)
  }

  const toggleSuccessNotification = () => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }

  const changePassword = () => {
    togglePasswordChangeModal()
    toggleSuccessNotification()
  }

  return (
    <>
      <ListViewItemSimplified
        label={
          <LabelContainer>
            {intl.formatMessage(constantsMessages.labelPassword)}
          </LabelContainer>
        }
        value={<ValueContainer>********</ValueContainer>}
        actions={
          <DynamicHeightLinkButton
            id="BtnChangePassword"
            onClick={togglePasswordChangeModal}
            disabled={!isOnline}
          >
            {intl.formatMessage(buttonMessages.change)}
          </DynamicHeightLinkButton>
        }
      />
      <PasswordChangeModal
        togglePasswordChangeModal={togglePasswordChangeModal}
        showPasswordChange={showModal}
        passwordChanged={changePassword}
      />
      {showSuccessNotification && (
        <Toast type="success" onClose={toggleSuccessNotification}>
          <FormattedMessage {...userMessages.passwordUpdated} />
        </Toast>
      )}
    </>
  )
}
