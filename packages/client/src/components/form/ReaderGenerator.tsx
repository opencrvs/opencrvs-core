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
  Ii18nReaderType
} from '@client/forms'
import { RedirectField } from './Redirect'
import { isReaderQR, isReaderRedirect } from '@client/forms/utils'

interface ReaderGeneratorProps extends Scan {
  readers: Ii18nReaderType[]
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
  return readers.map((reader) => {
    const { type } = reader
    if (isReaderQR(reader)) {
      return (
        <QRReader
          key={type}
          labels={reader.labels}
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
          fieldDefinition={reader}
          fields={fields}
          setFieldValue={setFieldValue}
          isDisabled={false}
        />
      )
    } else return null
  })
}
