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
import { buttonMessages, errorMessages } from '@client/i18n/messages'
import { Toast } from '@opencrvs/components/lib/Toast'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

const notificationActionButtonHandler = () => {
  window.location.reload()
}

export const GenericErrorToast = () => {
  const intl = useIntl()
  const [isVisible, setIsVisible] = useState(true)

  return isVisible ? (
    <Toast
      id="error-toast"
      type="warning"
      actionText={intl.formatMessage(buttonMessages.retry)}
      onActionClick={notificationActionButtonHandler}
      onClose={() => setIsVisible(false)}
    >
      {intl.formatMessage(errorMessages.pageLoadFailed)}
    </Toast>
  ) : (
    <></>
  )
}
