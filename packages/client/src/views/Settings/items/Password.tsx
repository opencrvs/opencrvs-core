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
import { Toast } from '@opencrvs/components/lib/Toast'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  DynamicHeightLinkButton,
  SettingsRow
} from '@client/views/Settings/items/components'
import {
  constantsMessages,
  buttonMessages,
  userMessages
} from '@client/i18n/messages'
import { PasswordChangeModal } from '@client/views/Settings/PasswordChangeModal'
import { useOnlineStatus } from '@client/utils'

export function usePassword(): SettingsRow {
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

  return {
    id: 'password',
    item: {
      label: intl.formatMessage(constantsMessages.labelPassword),
      value: '********',
      actions: (
        <DynamicHeightLinkButton
          id="btnChangePassword"
          onClick={togglePasswordChangeModal}
          disabled={!isOnline}
        >
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      )
    },
    overlay: (
      <>
        {showModal && (
          <PasswordChangeModal
            togglePasswordChangeModal={togglePasswordChangeModal}
            passwordChanged={changePassword}
          />
        )}
        {showSuccessNotification && (
          <Toast type="success" onClose={toggleSuccessNotification}>
            <FormattedMessage {...userMessages.passwordUpdated} />
          </Toast>
        )}
      </>
    )
  }
}
