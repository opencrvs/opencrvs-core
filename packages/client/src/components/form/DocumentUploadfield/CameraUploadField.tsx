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
import { ErrorText, ISelectOption, Select } from '@client/../../components/lib'
import {
  PrimaryButton,
  SecondaryButton
} from '@client/../../components/lib/buttons'
import { buttonMessages, formMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/notifications'
import { EMPTY_STRING } from '@client/utils/constants'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import React, { ReactNode } from 'react'
import { Camera } from 'react-feather'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from 'styled-components'

export const ErrorMessage = styled.div`
  margin-bottom: 16px;
`

const VideoOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: -64px;
  z-index: 1;
  background: ${({ theme }) => theme.colors.white};
`

const Video = styled.video`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
`

const TakePhotoButton = styled(PrimaryButton)`
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  border-radius: 36px;
  background-color: blue;
  padding: 0 12px;
  z-index: 2;
`

const VideoLoadingIndicator = styled(LoadingIndicator)`
  position: absolute;
  left: 50px;
  top: 350px;
  z-index: 2;
  margin: 16px;
`

type IFullProps = {
  isValid: () => boolean
  isMobile: boolean
  disabled: boolean
  handleFileChange: (uploadedImage: File) => void
} & IntlShapeProps

type IState = {
  cameraOptions: ISelectOption[]
  selectedCamera: string
  showVideo: boolean
  loadingVideo: boolean
  errorMessage: string
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
      loadingVideo: false,
      errorMessage: EMPTY_STRING
    }
  }

  onCameraChange = (selectedCamera: string) => {
    this.setState({
      selectedCamera: selectedCamera
    })
  }

  startStreaming = async () => {
    this.setState((prevState) => {
      return {
        ...prevState,
        loadingVideo: true
      }
    })
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      let mediaOptions: ISelectOption[] = []
      devices.map((mediaDeviceInfo, index, arr) => {
        if (mediaDeviceInfo.kind === 'videoinput') {
          // TODO: If there is more than one camera, add a button to switch to other camera (for mobile devices)
          mediaOptions = mediaOptions.concat({
            value: mediaDeviceInfo.deviceId,
            label: mediaDeviceInfo.label || 'Camera ' + (index + 1)
          })
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
    this.videoRef.current!.srcObject = this.stream
    this.setState((prevState) => {
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
      })
      .catch(() => {
        this.setState((prevState) => {
          return {
            ...prevState,
            showVideo: false,
            errorMessage: this.props.intl.formatMessage(
              messages.imageCaptureFailed
            )
          }
        })
        throw Error(this.props.intl.formatMessage(messages.imageCaptureFailed))
      })
      .finally(() => {
        this.stream.getTracks().forEach((track) => {
          track.stop()
        })
      })
  }

  render(): ReactNode {
    const { intl, isMobile } = this.props
    return (
      <div>
        <SecondaryButton
          id="upload_photo"
          icon={() => <Camera />}
          disabled={this.props.disabled}
          onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
            if (this.props.isValid()) {
              this.startStreaming()
            }
          }}
        >
          {isMobile ? undefined : intl.formatMessage(formMessages.openCamera)}
        </SecondaryButton>
        <ErrorMessage id="upload-error">
          {this.state.errorMessage && (
            <ErrorText>{this.state.errorMessage}</ErrorText>
          )}
        </ErrorMessage>
        <VideoOverlay
          style={{ display: this.state.showVideo ? 'block' : 'none' }}
        >
          {this.state.loadingVideo && <VideoLoadingIndicator loading={true} />}
          <Video autoPlay playsInline ref={this.videoRef} />
          <TakePhotoButton
            id="take_photo"
            icon={() => <Camera />}
            onClick={(e): void => {
              this.takePhoto()
            }}
          />
        </VideoOverlay>
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
