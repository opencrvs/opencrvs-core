import { PrimaryButton } from '@client/../../components/lib/buttons'
import { BarcodeDetector } from 'barcode-detector'
import React, { useEffect, useRef, useState } from 'react'

interface QRCodeScannerProps {
  label: string
  fallbackErrorMessage: string
  onScanSuccess: (data: any) => void
}

const QRCodeScanner = (props: QRCodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [barcodeDetector, setBarcodeDetector] =
    useState<BarcodeDetector | null>(null)
  const [isScanInitiated, setIsScanInitiated] = useState(false)

  useEffect(() => {
    const videoCurrent = videoRef.current
    if (!('BarcodeDetector' in window)) {
      console.error('Barcode Detector is not supported by this browser.')
      return
    }
    if (isScanInitiated) {
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
          console.error('Error accessing the camera: ', err)
        })

      return () => {
        if (videoCurrent && videoCurrent.srcObject) {
          const stream = videoCurrent.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }, [isScanInitiated])

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
                // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="camera">
      {isScanInitiated && (
        <video ref={videoRef} id="video">
          {props.fallbackErrorMessage}
        </video>
      )}
      <PrimaryButton id="start-button" onClick={() => setIsScanInitiated(true)}>
        {props.label}
      </PrimaryButton>
    </div>
  )
}

export default QRCodeScanner
