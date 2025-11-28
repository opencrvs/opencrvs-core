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
import { QrReaderField, QrReaderFieldValue } from '@opencrvs/commons/client'
import {
  tutorialMessages,
  messages as qrReaderMessages
} from '@client/i18n/messages/views/qr-reader'

interface QrReaderInputProps {
  // TODO: imnplement configuration props
  // eslint-disable-next-line react/no-unused-prop-types
  configuration: QrReaderField['configuration']
  onChange: (data: QrReaderFieldValue) => void
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
      // TODO: implement validation using props.configuration.validator
      // In future we might come up with a configurable resolver approach
      // or any alternative transformation method that would process the input
      // data to a predictable type-strict structure and then we can get rid
      // of this type assertion
      onScan={(data) => props.onChange({ data } as QrReaderFieldValue)}
    />
  )
}

export const QrReader = {
  Input: QrReaderInput,
  Output: null
}
