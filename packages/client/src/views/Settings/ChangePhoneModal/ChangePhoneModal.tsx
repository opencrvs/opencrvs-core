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
import { ChangeNumberView } from '@client/views/Settings/ChangePhoneModal/ChangeNumberView'
import { VerifyCodeView } from '@client/views/Settings/ChangePhoneModal/VerifyCodeView'

const VIEW_TYPE = {
  CHANGE_NUMBER: 'change',
  VERIFY_NUMBER: 'verify'
}

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
}

export function ChangePhoneModal({ show, onClose, onSuccess }: IProps) {
  const [view, setView] = React.useState(VIEW_TYPE.CHANGE_NUMBER)
  const [phoneNumber, setPhoneNumber] = React.useState(EMPTY_STRING)
  const onSuccessChangeNumber = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber)
    setView(VIEW_TYPE.VERIFY_NUMBER)
  }
  const restoreState = () => {
    setView(VIEW_TYPE.CHANGE_NUMBER)
    setPhoneNumber(EMPTY_STRING)
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <>
      <ChangeNumberView
        show={show && view === VIEW_TYPE.CHANGE_NUMBER}
        onSuccess={onSuccessChangeNumber}
        onClose={onClose}
      />
      <VerifyCodeView
        show={show && view === VIEW_TYPE.VERIFY_NUMBER}
        onSuccess={onSuccess}
        onClose={onClose}
        data={{ phoneNumber }}
      />
    </>
  )
}
