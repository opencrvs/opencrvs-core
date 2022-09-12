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
import { buttonMessages, errorMessages } from '@client/i18n/messages'
import {
  NOTIFICATION_TYPE as TOAST_TYPE,
  Toast
} from '@opencrvs/components/lib/Toast'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'

export enum NOTIFICATION_TYPE {
  ERROR
}

const notificationActionButtonHandler = () => {
  window.location.reload()
}

function getErrorNotification(intl: any) {
  return (
    <Toast
      id="error-toast"
      type={TOAST_TYPE.ERROR}
      actionText={intl.formatMessage(buttonMessages.retry)}
      onActionClick={notificationActionButtonHandler}
      show={true}
    >
      {intl.formatMessage(errorMessages.pageLoadFailed)}
    </Toast>
  )
}

export const ToastNotification = injectIntl(
  (props: WrappedComponentProps & { type: NOTIFICATION_TYPE }) => {
    const { intl, type } = props

    return <>{type === NOTIFICATION_TYPE.ERROR && getErrorNotification(intl)}</>
  }
)
