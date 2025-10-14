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
import { useIntl } from 'react-intl'
import React from 'react'
import { QrReader as QrReaderUI } from '@opencrvs/components/lib/IdReader/readers/QrReader/QrReader'
import { QrReaderField } from '@opencrvs/commons/client'
import {
  tutorialMessages,
  messages as qrReaderMessages
} from '@client/i18n/messages/views/qr-reader'

interface QrReaderInputProps {
  configuration: QrReaderField['configuration']
  onChange: (data: unknown) => void
}

function QrReaderInput(props: QrReaderInputProps) {
  const intl = useIntl()
  return (
    <QrReaderUI
      fullWidth
      labels={{
        button: intl.formatMessage(qrReaderMessages.button),
        scannerDialogSupportingCopy: intl.formatMessage(
          qrReaderMessages.scannerDialogSupportingCopy
        ),
        tutorial: {
          cameraCleanliness: intl.formatMessage(
            tutorialMessages.cameraCleanliness
          ),
          distance: intl.formatMessage(tutorialMessages.distance),
          lightBalance: intl.formatMessage(tutorialMessages.lightBalance)
        }
      }}
      validator={props.configuration?.validator}
      onScan={(data) => props.onChange({ data })}
    />
  )
}

export const QrReader = {
  Input: QrReaderInput,
  Output: null
}
