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
import { EMPTY_STRING } from '@client/utils/constants'
import * as React from 'react'
import { ChangeEmailView } from '@client/views/Settings/ChangeEmailModal/ChangeEmailView'
import { VerifyCodeView } from '@client/views/Settings/ChangePhoneModal/VerifyCodeView'

const VIEW_TYPE = {
  CHANGE_EMAIL: 'change',
  VERIFY_NUMBER: 'verify'
}

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
}

export function ChangeEmailModal({ show, onClose, onSuccess }: IProps) {
  const [view, setView] = React.useState(VIEW_TYPE.CHANGE_EMAIL)
  const [emailAddress, setEmailAddress] = React.useState(EMPTY_STRING)
  const onSuccessChangeEmail = (emailAddress: string) => {
    setEmailAddress(emailAddress)
    setView(VIEW_TYPE.VERIFY_NUMBER)
  }
  const restoreState = () => {
    setView(VIEW_TYPE.CHANGE_EMAIL)
    setEmailAddress(EMPTY_STRING)
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <>
      <ChangeEmailView
        show={show && view === VIEW_TYPE.CHANGE_EMAIL}
        onSuccess={onSuccessChangeEmail}
        onClose={onClose}
      />
      <VerifyCodeView
        show={show && view === VIEW_TYPE.VERIFY_NUMBER}
        onSuccess={onSuccess}
        onClose={onClose}
        data={{ email: emailAddress }}
      />
    </>
  )
}
