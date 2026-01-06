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
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import Cropper from 'react-easy-crop'
import type { Area, Point, Size } from 'react-easy-crop'
import styled, { useTheme } from 'styled-components'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Button, Link } from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages'
import { useModal } from '@client/hooks/useModal'
import { getCroppedImageWithTargetSize, IImage } from '@client/utils/imageUtils'
import { ImageLoader } from '@client/views/Settings/ImageLoader'
import { Slider } from './Slider'

const messages = {
  title: {
    id: 'imageEditorModal.title',
    defaultMessage: 'Crop & resize image',
    description: 'Title for the image editor modal'
  },
  description: {
    id: 'imageEditorModal.description',
    defaultMessage: 'Resize and position the chosen image',
    description: 'Description for the image editor modal'
  }
}

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
const Error = styled.div`
  color: ${({ theme }) => theme.colors.negative};
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
interface ImageEditorModalProps {
  onClose: (result: IImage | null) => void
  imgSrc: IImage
  error: string
  targetSize?: {
    height: number
    width: number
  }
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

function ImageEditorModal({
  onClose,
  imgSrc: imgSrcFromParent,
  error: errorFromParent,
  targetSize
}: ImageEditorModalProps) {
  const intl = useIntl()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState(DEFAULT_AREA)
  const theme = useTheme()
  const [error, setError] = useState(errorFromParent)
  const [imgSrc, setImgSrc] = useState<IImage>(imgSrcFromParent)

  useEffect(() => {
    setImgSrc(imgSrcFromParent)
  }, [imgSrcFromParent])

  useEffect(() => {
    setError(errorFromParent)
  }, [errorFromParent])

  const reset = () => {
    setCrop(DEFAULT_CROP)
    setCroppedArea(DEFAULT_AREA)
    setZoom(1)
    setError('')
  }

  const handleClickApply = async () => {
    const croppedImage = await getCroppedImageWithTargetSize(
      imgSrc,
      croppedArea,
      targetSize
    )
    if (croppedImage) {
      onClose(croppedImage)
      reset()
    }
  }

  const cropSize = useCropSize(theme.grid.breakpoints.md)
  return (
    <ResponsiveModal
      autoHeight
      actions={[
        <Button key="cancel" type="tertiary" onClick={() => onClose(null)}>
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button key="apply" type="primary" onClick={handleClickApply}>
          {intl.formatMessage(buttonMessages.apply)}
        </Button>
      ]}
      handleClose={() => onClose(null)}
      id="ImageEditorModal"
      show={true}
      title={intl.formatMessage(messages.title)}
      width={1080}
    >
      <Description>
        {error ? (
          <Error>{error}</Error>
        ) : (
          intl.formatMessage(messages.description)
        )}
        <ImageLoader
          onError={setError}
          onImageLoaded={(image) => {
            reset()
            setImgSrc(image)
          }}
        >
          <Link>{intl.formatMessage(buttonMessages.change)}</Link>
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
              onCropComplete={(_, area) => setCroppedArea(area)}
              onZoomChange={(newZoom) => setZoom(newZoom)}
            />
          </Container>
          <Slider value={zoom} onChange={(val) => setZoom(+val)} />
        </>
      )}
    </ResponsiveModal>
  )
}

export function useImageEditorModal(options?: {
  targetSize: ImageEditorModalProps['targetSize']
}) {
  const [modal, openModal] = useModal()
  const openEditorModal = async (imgSrc: IImage, error: string) =>
    openModal<IImage | null>((close) => (
      <ImageEditorModal
        error={error}
        imgSrc={imgSrc}
        targetSize={options?.targetSize}
        onClose={close}
      />
    ))
  return [modal, openEditorModal] as const
}
