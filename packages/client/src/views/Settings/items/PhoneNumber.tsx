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
import {
  buttonMessages,
  constantsMessages,
  userMessages
} from '@client/i18n/messages'
import { IStoreState } from '@client/store'
import { useOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { ChangePhoneModal } from '@client/views/Settings/ChangePhoneModal/ChangePhoneModal'
import {
  DynamicHeightLinkButton,
  LabelContainer,
  ValueContainer
} from '@client/views/Settings/items/components'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'

export function PhoneNumber() {
  const intl = useIntl()
  const isOnline = useOnlineStatus()
  const mobile = useSelector<IStoreState, string>(
    (state) => state.profile.userDetails?.mobile || ''
  )
  const dispatch = useDispatch()

  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const toggleSuccessNotification = () => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }
  const toggleChangePhoneModal = () => {
    setShowModal((prevValue) => !prevValue)
  }
  const handleSuccess = () => {
    toggleChangePhoneModal()
    toggleSuccessNotification()
  }

  return (
    <>
      <ListViewItemSimplified
        label={
          <LabelContainer>
            {intl.formatMessage(constantsMessages.labelPhone)}
          </LabelContainer>
        }
        value={<ValueContainer>{mobile}</ValueContainer>}
        actions={
          <DynamicHeightLinkButton
            onClick={toggleChangePhoneModal}
            disabled={!isOnline}
          >
            {intl.formatMessage(buttonMessages.change)}
          </DynamicHeightLinkButton>
        }
      />
      <ChangePhoneModal
        show={showModal}
        onClose={toggleChangePhoneModal}
        onSuccess={handleSuccess}
      />
      {showSuccessNotification && (
        <Toast type="success" onClose={toggleSuccessNotification}>
          <FormattedMessage {...userMessages.phoneNumberUpdated} />
        </Toast>
      )}
    </>
  )
}
