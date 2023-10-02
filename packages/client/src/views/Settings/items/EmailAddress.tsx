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
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import { useOnlineStatus } from '@client/utils'
import { ChangeEmailModal } from '@client/views/Settings/ChangeEmailModal/ChangeEmailModal'
import { getUserDetails } from '@client/profile/profileSelectors'

export function EmailAddress() {
  const intl = useIntl()
  const isOnline = useOnlineStatus()
  const email = useSelector<IStoreState, string>(
    (state) => state.profile.userDetails?.email || ''
  )

  const dispatch = useDispatch()

  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const toggleSuccessNotification = () => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }
  const toggleChangeEmailModal = () => {
    setShowModal((prevValue) => !prevValue)
  }
  const handleSuccess = () => {
    toggleChangeEmailModal()
    toggleSuccessNotification()
  }

  return (
    <>
      <ListViewItemSimplified
        label={
          <LabelContainer>
            {intl.formatMessage(constantsMessages.labelEmail)}
          </LabelContainer>
        }
        value={<ValueContainer>{email}</ValueContainer>}
        actions={
          <DynamicHeightLinkButton
            onClick={toggleChangeEmailModal}
            disabled={!isOnline}
          >
            {intl.formatMessage(buttonMessages.change)}
          </DynamicHeightLinkButton>
        }
      />
      <ChangeEmailModal
        show={showModal}
        onClose={toggleChangeEmailModal}
        onSuccess={handleSuccess}
      />
      {showSuccessNotification && (
        <Toast type="success" onClose={toggleSuccessNotification}>
          <FormattedMessage {...userMessages.emailAddressUpdated} />
        </Toast>
      )}
    </>
  )
}
