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
import { useIntl, FormattedMessage } from 'react-intl'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton
} from '@client/views/Settings/items/components'
import { useSelector, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import {
  constantsMessages,
  buttonMessages,
  userMessages
} from '@client/i18n/messages'
import {
  ListViewItemSimplified,
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { useOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { ChangePhoneModal } from '@client/views/Settings/ChangePhoneModal'

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
      <FloatingNotification
        type={NOTIFICATION_TYPE.SUCCESS}
        show={showSuccessNotification}
        callback={toggleSuccessNotification}
      >
        <FormattedMessage {...userMessages.phoneNumberUpdated} />
      </FloatingNotification>
    </>
  )
}
