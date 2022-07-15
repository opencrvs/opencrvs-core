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
} from '@client/views/Settings/items/utils'
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
import {
  withOnlineStatus,
  useOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import { goToPhoneSettings } from '@client/navigation'
import { useHistory } from 'react-router'
import { SETTINGS } from '@client/navigation/routes'

export function PhoneNumber() {
  const intl = useIntl()
  const isOnline = useOnlineStatus()
  const mobile = useSelector<IStoreState, string>(
    (state) => state.profile.userDetails?.mobile || ''
  )
  const dispatch = useDispatch()
  const onClickChange = () => dispatch(goToPhoneSettings())

  const history = useHistory()
  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState(false)
  const toggleSuccessNotification = () => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }

  React.useEffect(() => {
    if (history && history.location.state) {
      let phonedNumberUpdated = false
      const historyState = history.location.state as Record<string, boolean>
      phonedNumberUpdated = historyState.phonedNumberUpdated
      if (phonedNumberUpdated) {
        toggleSuccessNotification()
        history.replace({
          pathname: SETTINGS,
          state: { phonedNumberUpdated: false }
        })
      }
    }
  }, [history])

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
          <DynamicHeightLinkButton onClick={onClickChange} disabled={!isOnline}>
            {intl.formatMessage(buttonMessages.change)}
          </DynamicHeightLinkButton>
        }
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
