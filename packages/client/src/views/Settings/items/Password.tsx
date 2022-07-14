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
import * as React from 'react'
import {
  ListViewItemSimplified,
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton
} from '@client/views/Settings/items/utils'
import {
  constantsMessages,
  buttonMessages,
  userMessages
} from '@client/i18n/messages'
import { PasswordChangeModal } from '@client/views/Settings/PasswordChangeModal'

export function Password() {
  const intl = useIntl()
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
      <FloatingNotification
        type={NOTIFICATION_TYPE.SUCCESS}
        show={showSuccessNotification}
        callback={toggleSuccessNotification}
      >
        <FormattedMessage {...userMessages.passwordUpdated} />
      </FloatingNotification>
    </>
  )
}
