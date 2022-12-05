/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  ImageUploader,
  ISelectOption,
  LeftNavigation,
  Select
} from '@client/../../components/lib'
import {
  PrimaryButton,
  SecondaryButton
} from '@client/../../components/lib/buttons'
import { buttonMessages, formMessages } from '@client/i18n/messages'
import { EMPTY_STRING } from '@client/utils/constants'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import React, { ReactNode } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from 'styled-components'

const PhotoUploader = styled(SecondaryButton)`
  margin-left: 16px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 8px;
  }
`

type IFullProps = {
  isValid: () => boolean
  handleFileChange: (uploadedImage: File) => void
} & IntlShapeProps

type IState = {
  cameraOptions: ISelectOption[]
  selectedCamera: string
  showVideo: boolean
  loadingVideo: boolean
}

class CameraUploadFieldComp extends React.Component<IFullProps, IState> {
  private videoRef: React.RefObject<HTMLVideoElement>
  private stream: MediaStream
  constructor(props: IFullProps) {
    super(props)
    this.stream = new MediaStream()
    this.videoRef = React.createRef()
    this.state = {
      cameraOptions: [],
      selectedCamera: EMPTY_STRING,
      showVideo: false,
      loadingVideo: false
    }
  }

  onCameraChange = (selectedCamera: string) => {
    this.setState({
      selectedCamera: selectedCamera
    })
  }

  startStreaming = async () => {
    this.setState((prevState) => {
      console.log('setting loadingVideo to true')
      return {
        ...prevState,
        loadingVideo: true
      }
    })
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      let mediaOptions: ISelectOption[] = []
      devices.map((mediaDeviceInfo, index, arr) => {
        if (mediaDeviceInfo.kind === 'videoinput') {
          mediaOptions = mediaOptions.concat({
            value: mediaDeviceInfo.deviceId,
            label: mediaDeviceInfo.label || 'Camera ' + (index + 1)
          })
          console.log('finished getting media, setting state')
          this.setState((prevState) => {
            return {
              ...prevState,
              cameraOptions: mediaOptions,
              selectedCamera: mediaOptions[0].value
            }
          })
        }
      })
    })

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: this.state.selectedCamera
        ? { deviceId: this.state.selectedCamera }
        : true
    })
    console.log('setting video source object')
    this.videoRef.current!.srcObject = this.stream
    this.setState((prevState) => {
      console.log('setting loadingVideo to false')
      return {
        ...prevState,
        showVideo: true,
        loadingVideo: false
      }
    })
  }

  cancel = async () => {
    this.setState((prevState) => {
      return {
        ...prevState,
        showVideo: false
      }
    })
    this.stream.getTracks().forEach((track) => {
      track.stop()
    })
  }

  takePhoto = async () => {
    const imageCapture = new (window as any).ImageCapture(
      this.stream.getVideoTracks()[0]
    )

    imageCapture
      .takePhoto()
      .then((blob: Blob) => {
        this.setState((prevState) => {
          return {
            ...prevState,
            imageSource: URL.createObjectURL(blob),
            showVideo: false
          }
        })
        const file = blobToFile(blob, 'some-name.jpg')
        this.props.handleFileChange(file)
        this.stream.getTracks().forEach((track) => {
          track.stop()
        })
      })
      .catch(function (error: Error) {
        console.log('takePhoto() error: ', error)
      })
  }

  render(): ReactNode {
    console.log('rendering with loadingVideo set to ', this.state.loadingVideo)
    const { intl } = this.props
    return (
      <div>
        <PhotoUploader
          id="upload_photo"
          onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
            if (this.props.isValid()) {
              this.startStreaming()
            }
          }}
        >
          {intl.formatMessage(formMessages.openCamera)}
        </PhotoUploader>
        <div
          style={{
            position: 'absolute',
            display: this.state.showVideo ? 'inline-block' : 'none',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            zIndex: 10
          }}
        >
          <video
            autoPlay
            playsInline
            ref={this.videoRef}
            style={{ width: '100%', height: '80%' }}
          ></video>

          <div style={{ width: '50%' }}>
            <Select
              id="camera-source"
              options={this.state.cameraOptions}
              onChange={this.onCameraChange}
              value={this.state.selectedCamera}
            />
          </div>
          <PrimaryButton
            id="take_photo"
            onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
              this.takePhoto()
            }}
          >
            {intl.formatMessage(formMessages.takePhoto)}
          </PrimaryButton>
          <SecondaryButton
            id="cancel_photo"
            onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
              this.cancel()
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </SecondaryButton>
          <div
            style={{
              display: this.state.loadingVideo ? 'block' : 'none'
            }}
          >
            <LoadingIndicator loading={true} />
          </div>
        </div>
      </div>
    )
  }
}

export const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, {
    lastModified: new Date().getTime(),
    type: blob.type
  })
}

export const CameraUploadField = injectIntl<'intl', IFullProps>(
  CameraUploadFieldComp
)
