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
import { ReaderType, Scan } from '@opencrvs/components/src/IDReader/types'
import { QRReader } from '@opencrvs/components/src/IDReader/readers/QRReader/QRReader'

interface ReaderGeneratorProps extends Scan {
  readers: ReaderType[]
}
export const ReaderGenerator = ({
  readers,
  onScan,
  onError
}: ReaderGeneratorProps) => {
  return readers.map((reader) => {
    const { type, ...readerProps } = reader
    if (type === 'qr') {
      return (
        <QRReader
          key={type}
          {...readerProps}
          onScan={onScan}
          onError={onError}
        />
      )
    } else return null
  })
}
