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
import {
  PrimaryButton,
  SecondaryButton
} from '@client/../../components/lib/buttons'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Scanner1 from './variants/Scanner1'
import Scanner2 from './variants/Scanner2'

interface QRCodeScannerProps {
  label: string
  fallbackErrorMessage: string
  onScanSuccess: (data: any) => void
  variant_Experimental: number
}

function useScanner(
  variant: number,
  onScanSuccuss: QRCodeScannerProps['onScanSuccess'],
  fallbackErrorMessage: QRCodeScannerProps['fallbackErrorMessage']
) {
  const [isScanInitiated, setIsScanInitiated] = useState(false)
  const [isScanPermitted, setIsScanPermitted] = useState(true)
  const [isScanComplete, setIsScanComplete] = useState(false)

  const handleScanSuccess = (data: any) => {
    setIsScanComplete(true)
    onScanSuccuss(data)
  }

  return {
    isScanInitiated,
    isScanPermitted,
    isScanComplete,
    initiateScan: () => setIsScanInitiated(true),
    stopScan: () => setIsScanInitiated(false),
    renderScanner: () =>
      variant === 1 ? (
        <Scanner1
          onPermissionDenined={() => setIsScanPermitted(false)}
          onScanSuccess={handleScanSuccess}
          fallbackErrorMessage={fallbackErrorMessage}
        />
      ) : (
        <Scanner2
          onPermissionDenined={() => setIsScanPermitted(false)}
          onScanSuccess={handleScanSuccess}
          fallbackErrorMessage={fallbackErrorMessage}
        />
      )
  }
}

const QRCodeScanner = (props: QRCodeScannerProps) => {
  const {
    isScanInitiated,
    isScanPermitted,
    isScanComplete,
    initiateScan,
    stopScan,
    renderScanner
  } = useScanner(
    props.variant_Experimental,
    props.onScanSuccess,
    props.fallbackErrorMessage
  )
  const handleClickButton =
    isScanInitiated && !isScanComplete ? stopScan : initiateScan
  return (
    <div>
      {isScanInitiated && isScanPermitted && !isScanComplete && renderScanner()}
      <PrimaryButton id="start-button" onClick={handleClickButton}>
        {isScanInitiated ? 'Close scan' : props.label}
      </PrimaryButton>
    </div>
  )
}

export default QRCodeScanner
