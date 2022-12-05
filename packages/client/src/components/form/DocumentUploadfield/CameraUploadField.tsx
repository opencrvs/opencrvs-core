import {
  ImageUploader,
  ISelectOption,
  Select
} from '@client/../../components/lib'
import { SecondaryButton } from '@client/../../components/lib/buttons'
import { EMPTY_STRING } from '@client/utils/constants'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import React, { ReactNode } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from 'styled-components'

const TakePhotoButton = styled(ImageUploader)`
  position: absolute;
  top: 50;
  left: 50;
`

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
          Take Photo
        </PhotoUploader>
        <div
          style={{
            position: 'relative',
            display: this.state.showVideo ? 'inline-block' : 'none',
            width: 400,
            height: 550
          }}
        >
          <video autoPlay playsInline ref={this.videoRef}></video>
          <div
            style={
              this.state.loadingVideo
                ? {
                    position: 'absolute',
                    top: 60,
                    left: 200,
                    display: 'block'
                  }
                : {
                    display: 'none'
                  }
            }
          >
            <LoadingIndicator loading={true} />
          </div>
          <div style={{ position: 'absolute', left: 50, top: 50 }}>
            <TakePhotoButton
              id="take_photo"
              title={'Click!'}
              onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
                e.preventDefault()
                this.takePhoto()
              }}
              handleFileChange={this.props.handleFileChange}
            />
          </div>
          <Select
            id="camera-source"
            options={this.state.cameraOptions}
            onChange={this.onCameraChange}
            value={this.state.selectedCamera}
          />
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
