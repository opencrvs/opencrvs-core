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
import { EMPTY_STRING } from '@client/utils/constants'
import * as React from 'react'
import { ChangeNumberView } from '@client/views/Settings/ChangePhoneModal/ChangeNumberView'
import { VerifyCodeView } from '@client/views/Settings/ChangePhoneModal/VerifyCodeView'
import { ResponsiveModal, TextInput } from '@client/../../components/lib'
import { useIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { messages } from '@client/i18n/messages/views/notifications'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
}

export function ExportReportModal({ show, onClose, onSuccess }: IProps) {
  const intl = useIntl()
  const [phoneNumber, setPhoneNumber] = React.useState(EMPTY_STRING)
  const onSuccessChangeNumber = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber)
  }
  const restoreState = () => {
    setPhoneNumber(EMPTY_STRING)
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <ResponsiveModal
      id="ExportReportModal"
      show={show}
      title={intl.formatMessage(messages.changePhoneLabel)}
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={onClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <PrimaryButton
          id="continue-button"
          key="continue"
          onClick={() => {
            console.log('Click')
            //continueButtonHandler(phoneNumber)
          }}
          //disabled={!Boolean(phoneNumber.length) || isInvalidPhoneNumber}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      ]}
      handleClose={onClose}
      contentHeight={150}
      contentScrollableY={true}
    >
      <TextInput
        id="PhoneNumber"
        type="number"
        touched={true}
        //error={isInvalidPhoneNumber}
        value={1232}
        // onChange={onChangePhoneNumber}
      />
    </ResponsiveModal>
  )
}
