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
import React, { useEffect, useRef, useState } from 'react'
import QRScanner from 'qr-scanner'
import QRFrameSVG from './qr-frame.svg'
import styled from 'styled-components'

interface ScannerProps {
  onPermissionDenined: () => void
  fallbackErrorMessage: string
  onScanSuccess: (data: any) => void
}

const QRReader = styled.div`
  width: 518px;
  height: 518px;
  margin: 0 auto;
  position: relative;

  @media (max-width: 426px) {
    width: 100%;
  }
`
const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const QRBox = styled.div`
  width: 100% !important;
  left: 0 !important;
`

const QRFrame = styled.img`
  position: absolute;
  fill: none;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
`
const Scanner2 = (props: ScannerProps) => {
  const scanner = useRef<QRScanner>()
  const videoElement = useRef<HTMLVideoElement>(null)
  const qrBoxElement = useRef<HTMLDivElement>(null)
  const [qrOn, setQrOn] = useState(true)
  const { onPermissionDenined, onScanSuccess, fallbackErrorMessage } = props

  const onScanFail = (error: string | Error) => {
    console.log(error)
  }

  useEffect(() => {
    const currentVideoElement = videoElement?.current
    if (currentVideoElement && !scanner.current) {
      scanner.current = new QRScanner(currentVideoElement, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: 'environment',
        highlightCodeOutline: true,
        highlightScanRegion: true,
        overlay: qrBoxElement?.current || undefined
      })

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) {
            onPermissionDenined()
          }
        })
    }

    return () => {
      if (!currentVideoElement) {
        scanner?.current?.stop()
      }
    }
  }, [onScanSuccess, onPermissionDenined])

  useEffect(() => {
    if (!qrOn) alert(fallbackErrorMessage)
  }, [qrOn, fallbackErrorMessage])

  return (
    <QRReader className="qr-reader">
      <Video ref={videoElement}></Video>
      <QRBox ref={qrBoxElement}>
        <QRFrame src={QRFrameSVG} alt="Qr Frame" width={256} height={256} />
      </QRBox>
    </QRReader>
  )
}

export default Scanner2
