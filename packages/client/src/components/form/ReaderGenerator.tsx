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
import React from 'react'
import { Scan } from '@opencrvs/components/src/IDReader/types'
import { QRReader } from '@opencrvs/components/src/IDReader/readers/QRReader/QRReader'
import {
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  Ii18nRedirectFormField,
  ReaderType
} from '@client/forms'
import { RedirectField } from './Redirect'
import {
  internationaliseFieldObject,
  isReaderQR,
  isReaderRedirect
} from '@client/forms/utils'
import { Stack } from '@opencrvs/components'
import {
  messages,
  tutorialMessages
} from '@client/i18n/messages/views/qr-reader'
import { useIntl } from 'react-intl'

interface ReaderGeneratorProps extends Scan {
  readers: ReaderType[]
  fields: IFormField[]
  form: IFormSectionData
  draft: IFormData
  setFieldValue: (name: string, value: IFormFieldValue) => void
}
export const ReaderGenerator = ({
  readers,
  onScan,
  onError,
  form,
  draft,
  fields,
  setFieldValue
}: ReaderGeneratorProps) => {
  const intl = useIntl()
  return (
    <Stack justifyContent="space-between">
      {readers.map((reader) => {
        const { type } = reader
        if (isReaderQR(reader)) {
          return (
            <QRReader
              key={type}
              labels={{
                button: intl.formatMessage(messages.button),
                scannerDialogSupportingCopy: intl.formatMessage(
                  messages.scannerDialogSupportingCopy
                ),
                tutorial: {
                  cameraCleanliness: intl.formatMessage(
                    tutorialMessages.cameraCleanliness
                  ),
                  distance: intl.formatMessage(tutorialMessages.distance),
                  lightBalance: intl.formatMessage(
                    tutorialMessages.lightBalance
                  )
                }
              }}
              onScan={onScan}
              onError={onError}
            />
          )
        } else if (isReaderRedirect(reader)) {
          return (
            <RedirectField
              key={type}
              form={form}
              draft={draft}
              fieldDefinition={
                internationaliseFieldObject(
                  intl,
                  reader
                ) as Ii18nRedirectFormField
              }
              fields={fields}
              setFieldValue={setFieldValue}
              isDisabled={false}
            />
          )
        } else return null
      })}
    </Stack>
  )
}
