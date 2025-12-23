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
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import Cropper from 'react-easy-crop'
import type { Area, Point, Size } from 'react-easy-crop'
import { useTheme } from 'styled-components'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Button } from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages'
import { useModal } from '@client/hooks/useModal'
import { IImage } from '@client/utils/imageUtils'

const messages = {
  title: {
    id: 'imageEditorModal.title',
    defaultMessage: 'Crop & resize image',
    description: 'Title for the image editor modal'
  }
}

interface ImageEditorModalProps {
  onClose: (result: boolean) => void
  imageSrc: IImage
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

function ImageEditorModal({ onClose, imageSrc }: ImageEditorModalProps) {
  const intl = useIntl()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState(DEFAULT_AREA)
  const theme = useTheme()

  const cropSize = useCropSize(theme.grid.breakpoints.md)
  return (
    <ResponsiveModal
      actions={[
        <Button key="cancel" type="tertiary" onClick={() => onClose(false)}>
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button key="apply" type="primary">
          {intl.formatMessage(buttonMessages.apply)}
        </Button>
      ]}
      id="ImageEditorModal"
      show={true}
      title={intl.formatMessage(messages.title)}
    >
      <Cropper
        crop={crop}
        cropShape="round"
        cropSize={cropSize}
        image={imageSrc.data}
        objectFit="vertical-cover"
        showGrid={false}
        zoom={zoom}
        onCropChange={(newCrop) => setCrop(newCrop)}
        onCropComplete={(_, area) => setCroppedArea(area)}
        onZoomChange={(newZoom) => setZoom(newZoom)}
      />
    </ResponsiveModal>
  )
}

export function useImageEditorModal({
  imageSrc
}: Omit<ImageEditorModalProps, 'onClose'>) {
  const [modal, openModal] = useModal()

  return {
    modal,
    openModal: async () =>
      openModal((close) => (
        <ImageEditorModal imageSrc={imageSrc} onClose={close} />
      ))
  }
}
