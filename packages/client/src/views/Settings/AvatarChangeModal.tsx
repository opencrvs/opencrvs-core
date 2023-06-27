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
import * as React from 'react'
import { Button } from '@opencrvs/components/lib/Button'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { gql } from '@apollo/client'
import Cropper from 'react-easy-crop'
import { Point, Area, Size } from 'react-easy-crop/types'
import { Mutation } from '@apollo/client/react/components'
import styled from '@client/styledComponents'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { connect } from 'react-redux'
import { ImageLoader } from './ImageLoader'
import { getCroppedImage, IImage } from '@client/utils/imageUtils'
import {
  withOnlineStatus,
  IOnlineStatusProps
} from '@client/views/OfficeHome/LoadingIndicator'
import { ITheme } from '@opencrvs/components/lib/theme'
import { withTheme } from 'styled-components'
import { Square } from '@opencrvs/components/lib/icons'
import { UserDetails } from '@client/utils/userUtils'

const Container = styled.div`
  align-self: center;
  border-radius: 4px;
  position: relative;
  aspect-ratio: 1;
`

const Description = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`

const SliderContainer = styled.div`
  display: flex;
  align-self: center;
  align-items: center;
  margin: 24px 0;
  padding: 0 16px;
  gap: 8px;
`

const StyledInput = styled.input`
  flex-grow: 1;
`

function Slider(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <SliderContainer>
      <Square width={12} height={12} color="grey400" />
      <StyledInput {...props} />
      <Square width={20} height={20} color="grey400" />
    </SliderContainer>
  )
}

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

export const changeAvatarMutation = gql`
  mutation changeAvatar($userId: String!, $avatar: AvatarInput!) {
    changeAvatar(userId: $userId, avatar: $avatar) {
      type
      data
    }
  }
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

function AvatarChangeModalComp({
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
    <Dialog
      id="ChangeAvatarModal"
      onOpen={showChangeAvatar}
      title={intl.formatMessage(messages.changeAvatar)}
      actions={[
        <Button
          key="cancel"
          id="modal_cancel"
          type="tertiary"
          onClick={handleCancel}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Mutation<{ changeAvatar: IImage }, { userId: string; avatar: IImage }>
          key="change-avatar-mutation"
          mutation={changeAvatarMutation}
          onCompleted={({ changeAvatar: avatar }) => {
            onAvatarChanged(avatar)
            reset()
          }}
        >
          {(changeAvatar) => {
            return (
              <Button
                key="apply"
                id="apply_change"
                type="primary"
                disabled={!isOnline || !!error}
                onClick={async () => {
                  const croppedImage = await getCroppedImage(
                    imgSrc,
                    croppedArea
                  )
                  if (
                    userDetails &&
                    userDetails.userMgntUserID &&
                    croppedImage
                  ) {
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
              </Button>
            )
          }}
        </Mutation>
      ]}
      onClose={handleCancel}
    >
      <Description>
        {!error && intl.formatMessage(messages.resizeAvatar)}
        {error && <Error>{error}</Error>}
        <ImageLoader
          onImageLoaded={(image) => {
            reset()
            setImgSrc(image)
          }}
          onError={(error) => setError(error)}
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
              image={imgSrc.data}
              crop={crop}
              aspect={1}
              cropShape="round"
              showGrid={false}
              cropSize={cropSize}
              objectFit="vertical-cover"
              zoom={zoom}
              onZoomChange={(newZoom) => setZoom(newZoom)}
              onCropChange={(newCrop) => setCrop(newCrop)}
              onCropComplete={async (_, croppedArea) =>
                setCroppedArea(croppedArea)
              }
            />
          </Container>
          <Slider
            type="range"
            value={zoom}
            min={1}
            step={0.02}
            max={3}
            onChange={({ target: { value } }) => setZoom(+value)}
          />
        </>
      )}
    </Dialog>
  )
}

const mapStateToProps = (state: IStoreState) => {
  return {
    userDetails: getUserDetails(state)
  }
}

export const AvatarChangeModal = connect(mapStateToProps)(
  injectIntl(withTheme(withOnlineStatus(AvatarChangeModalComp)))
)
