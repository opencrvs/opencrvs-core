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
import { BarcodeDetector } from 'barcode-detector'
import React, { useEffect, useRef, useState } from 'react'

interface ScannerProps {
  onPermissionDenined: () => void
  fallbackErrorMessage: string
  onScanSuccess: (data: any) => void
}

const Scanner1 = (props: ScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [barcodeDetector, setBarcodeDetector] =
    useState<BarcodeDetector | null>(null)
  const { onPermissionDenined } = props
  useEffect(() => {
    const videoCurrent = videoRef.current
    if (!('BarcodeDetector' in window)) {
      console.error('Barcode Detector is not supported by this browser.')
      return
    }
    const detector = new BarcodeDetector({ formats: ['qr_code'] })
    setBarcodeDetector(detector)

    const constraints = {
      video: {
        width: 518,
        facingMode: 'environment'
      }
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      })
      .catch((err) => {
        onPermissionDenined()
        console.error('Error accessing the camera: ', err)
      })

    return () => {
      if (videoCurrent && videoCurrent.srcObject) {
        const stream = videoCurrent.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [onPermissionDenined])

  useEffect(() => {
    const detectQRCode = () => {
      if (barcodeDetector && videoRef.current) {
        barcodeDetector
          .detect(videoRef.current)
          .then((barcodes) => {
            if (barcodes.length > 0) {
              props.onScanSuccess(barcodes[0].rawValue)
              // Stop capturing on successful scan
              if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach((track) => track.stop())
              }
            }
          })
          .catch((err) => {
            console.error('Barcode detection failed: ', err)
          })
      }
    }

    const interval = setInterval(detectQRCode, 1000) // Check every second
    return () => clearInterval(interval)
  }, [barcodeDetector, props])

  return (
    <div>
      <video ref={videoRef} id="video" muted>
        {props.fallbackErrorMessage}
      </video>
    </div>
  )
}

export default Scanner1
