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
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps } from 'react-intl'
import Cropper from 'react-easy-crop'
import type { Point, Area, Size } from 'react-easy-crop'
import styled from 'styled-components'
import {
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { ITheme } from '@opencrvs/components/lib/theme'

import { IOnlineStatusProps } from '@client/views/OfficeHome/LoadingIndicator'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { getCroppedImage, IImage } from '@client/utils/imageUtils'
import { UserDetails } from '@client/utils/userUtils'
import { ImageLoader } from './ImageLoader'
import { Slider } from './Slider'

const Container = styled.div`
  align-self: center;
  position: relative;
  width: min(600px, 90%);
  aspect-ratio: 1;
`

const Description = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`

const DefaultImage = styled.div<{ width: number; height: number }>`
  border-radius: 50%;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.grey100};
`

const Error = styled.div`
  color: ${({ theme }) => theme.colors.negative};
`

type IProps = IntlShapeProps &
  IOnlineStatusProps & {
    theme: ITheme
    showChangeAvatar: boolean
    cancelAvatarChangeModal: () => void
    imgSrc: IImage
    onImgSrcChanged: (img: IImage) => void
    error: string
    onErrorChanged: (error: string) => void
    onConfirmAvatarChange: () => void
    onAvatarChanged: (img: IImage) => void
    userDetails: UserDetails | null
  }

const DEFAULT_SIZE: Size = {
  height: 0,
  width: 0
}

const DEFAULT_CROP: Point = {
  x: 0,
  y: 0
}

const DEFAULT_AREA: Area = {
  ...DEFAULT_SIZE,
  ...DEFAULT_CROP
}

function useCropSize(breakpoint: number) {
  const [value, setValue] = React.useState<number>(360)

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth > breakpoint) {
        setValue(360)
      } else {
        setValue(240)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { width: value, height: value }
}

export function ImageEditorModal({
  showChangeAvatar,
  intl,
  cancelAvatarChangeModal,
  imgSrc,
  onImgSrcChanged: setImgSrc,
  error,
  onErrorChanged: setError,
  onConfirmAvatarChange,
  onAvatarChanged,
  isOnline,
  theme,
  userDetails
}: IProps) {
  const [crop, setCrop] = React.useState<Point>(DEFAULT_CROP)
  const [zoom, setZoom] = React.useState<number>(1)
  const [croppedArea, setCroppedArea] = React.useState<Area>(DEFAULT_AREA)

  const cropSize = useCropSize(theme.grid.breakpoints.md)

  const reset = () => {
    setCrop(DEFAULT_CROP)
    setCroppedArea(DEFAULT_AREA)
    setZoom(1)
    setError('')
  }

  const handleCancel = () => {
    cancelAvatarChangeModal()
    reset()
  }

  return (
    <ResponsiveModal
      autoHeight
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={handleCancel}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <PrimaryButton
          key="apply"
          disabled={!isOnline || !!error}
          id="apply_change"
          onClick={async () => {
            const croppedImage = await getCroppedImage(imgSrc, croppedArea)
            if (userDetails && userDetails.userMgntUserID && croppedImage) {
              changeAvatar({
                variables: {
                  userId: userDetails.userMgntUserID,
                  avatar: croppedImage
                }
              })
              onConfirmAvatarChange()
            }
          }}
        >
          {intl.formatMessage(buttonMessages.apply)}
        </PrimaryButton>
      ]}
      handleClose={handleCancel}
      id="ChangeAvatarModal"
      show={showChangeAvatar}
      title={intl.formatMessage(messages.changeAvatar)}
      width={1080}
    >
      <Description>
        {!error && intl.formatMessage(messages.resizeAvatar)}
        {error && <Error>{error}</Error>}
        <ImageLoader
          onError={(error) => setError(error)}
          onImageLoaded={(image) => {
            reset()
            setImgSrc(image)
          }}
        >
          <LinkButton size="small">
            {intl.formatMessage(messages.changeImage)}
          </LinkButton>
        </ImageLoader>
      </Description>
      {error ? (
        <DefaultImage {...cropSize}></DefaultImage>
      ) : (
        <>
          <Container>
            <Cropper
              aspect={1}
              crop={crop}
              cropShape="round"
              cropSize={cropSize}
              image={imgSrc.data}
              objectFit="vertical-cover"
              showGrid={false}
              zoom={zoom}
              onCropChange={(newCrop) => setCrop(newCrop)}
              onCropComplete={async (_, croppedArea) =>
                setCroppedArea(croppedArea)
              }
              onZoomChange={(newZoom) => setZoom(newZoom)}
            />
          </Container>
          <Slider
            max={3}
            min={1}
            step={0.02}
            type="range"
            value={zoom}
            onChange={({ target: { value } }) => setZoom(+value)}
          />
        </>
      )}
    </ResponsiveModal>
  )
}
