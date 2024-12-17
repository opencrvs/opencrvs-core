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
export interface QRReaderType {
  type: 'qr'
  labels: {
    button: string
    scannerDialogSupportingCopy: string
    tutorial: {
      cameraCleanliness: string
      distance: string
      lightBalance: string
    }
  }
}

// union of other reader types
export type ReaderType = QRReaderType

interface IDReader {
  dividerLabel: string
  manualInputInstructionLabel: string
  readers: [ReaderType, ...ReaderType[]] // at least one reader is needed to be provided
}

export interface Scan {
  onScan: (code: Record<string, unknown>) => void
  onError: (error: 'mount' | 'parse') => void
}

export interface ScannableIDReader extends IDReader, Scan {}

export interface ScannableQRReader extends Omit<QRReaderType, 'type'>, Scan {}
