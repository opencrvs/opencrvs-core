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
import styled from 'styled-components'

interface ScannerProps {
  onError: (error: 'mount' | 'parse') => void
  onScan: (data: Record<string, unknown>) => void
}

const QRReader = styled.div`
  width: 100%;
  height: 100%;
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

const Scanner = (props: ScannerProps) => {
  const scanner = useRef<QRScanner>()
  const videoElement = useRef<HTMLVideoElement>(null)
  const [qrOn, setQrOn] = useState(true)
  const { onError, onScan } = props

  useEffect(() => {
    const currentVideoElement = videoElement?.current
    if (currentVideoElement && !scanner.current) {
      scanner.current = new QRScanner(
        currentVideoElement,
        (result) => {
          if (result.data) {
            // TODO: handle parse error
            onScan(JSON.parse(result.data))
          }
        },
        {
          // TODO: improve error handling
          onDecodeError: () => onError('parse'),
          preferredCamera: 'environment',
          highlightCodeOutline: true,
          highlightScanRegion: false
        }
      )

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) {
            onError('mount')
          }
        })
    }

    return () => {
      if (currentVideoElement && currentVideoElement.srcObject) {
        const stream = currentVideoElement.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      } else {
        scanner?.current?.stop()
      }
    }
  }, [onScan, onError])

  useEffect(() => {
    if (!qrOn) alert('Could not scan')
  }, [qrOn])

  return (
    <QRReader>
      <Video ref={videoElement}></Video>
    </QRReader>
  )
}

export default Scanner
