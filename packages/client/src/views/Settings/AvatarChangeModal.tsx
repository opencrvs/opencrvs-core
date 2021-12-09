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
import { ResponsiveModal, Spinner } from '@opencrvs/components/lib/interface'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import {
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import gql from 'graphql-tag'
import Cropper from 'react-easy-crop'
import { Point, Area, Size } from 'react-easy-crop/types'
import { Mutation } from 'react-apollo'
import styled from '@client/styledComponents'
import { IUserDetails } from '@client/utils/userUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { connect } from 'react-redux'
import { ImageLoader } from './ImageLoader'
import { getCroppedImage, IImage } from '@client/utils/imageUtils'
import {
  withOnlineStatus,
  IOnlineStatusProps
} from '@client/views/RegistrationHome/LoadingIndicator'

const Container = styled.div`
  align-self: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 800px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 500px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 300px;
  }
`

const Wrapper = styled.div`
  position: relative;
  height: 600px;
  flex-grow: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    height: 500px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    height: 300px;
  }
`

const Description = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;
  }
`

const Slider = styled.input`
  width: 312px;
  align-self: center;
  margin: 30px 0px 30px 0px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 272px;
  }
`

const LoadingImage = styled.div`
  border-radius: 50%;
  width: 300px;
  height: 300px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.loadingImage};
`

export const changeAvatarMutation = gql`
  mutation changeAvatar($userId: String!, $avatar: AvatarInput!) {
    changeAvatar(userId: $userId, avatar: $avatar)
  }
`

type IProps = IntlShapeProps &
  IOnlineStatusProps & {
    showChangeAvatar: boolean
    cancelAvatarChangeModal: () => void
    image: IImage
    onAvatarChanged: (img: IImage) => void
    userDetails: IUserDetails | null
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

function AvatarChangeModalComp({
  showChangeAvatar,
  intl,
  cancelAvatarChangeModal,
  image: imageProp,
  onAvatarChanged,
  isOnline,
  userDetails
}: IProps) {
  const [crop, setCrop] = React.useState<Point>(DEFAULT_CROP)
  const [imageState, setImage] = React.useState<IImage>()
  const [zoom, setZoom] = React.useState<number>(1)
  const [cropSize, setCropSize] = React.useState<Size>(DEFAULT_SIZE)
  const [croppedArea, setCroppedArea] = React.useState<Area>(DEFAULT_AREA)
  const [avatar, setAvatar] = React.useState<IImage>()
  const [uploading, setUploading] = React.useState<boolean>(false)

  const resetCrop = () => {
    setCrop(DEFAULT_CROP)
    setCroppedArea(DEFAULT_AREA)
    setImage(undefined)
    setZoom(1)
    setAvatar(undefined)
    setUploading(false)
  }

  const handleCancel = () => {
    cancelAvatarChangeModal()
    resetCrop()
  }

  return (
    <ResponsiveModal
      id="ChangeAvatarModal"
      show={showChangeAvatar}
      title={intl.formatMessage(messages.changeAvatar)}
      fullscreen
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={handleCancel}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <Mutation<{}, { userId: string; avatar: IImage }>
          mutation={changeAvatarMutation}
          onCompleted={_ => {
            avatar && onAvatarChanged(avatar)
            resetCrop()
          }}
        >
          {changeAvatar => {
            return (
              <PrimaryButton
                key="apply"
                id="apply_change"
                disabled={
                  !userDetails ||
                  !userDetails.userMgntUserID ||
                  uploading ||
                  !isOnline
                }
                onClick={async () => {
                  setUploading(true)
                  const croppedImage = await getCroppedImage(
                    imageState ? imageState : imageProp,
                    croppedArea
                  )
                  if (croppedImage) setAvatar(croppedImage)
                  if (userDetails && userDetails.userMgntUserID && croppedImage)
                    changeAvatar({
                      variables: {
                        userId: userDetails.userMgntUserID,
                        avatar: croppedImage
                      }
                    })
                }}
              >
                {intl.formatMessage(buttonMessages.apply)}
              </PrimaryButton>
            )
          }}
        </Mutation>
      ]}
      handleClose={handleCancel}
    >
      <Description>
        {intl.formatMessage(messages.resizeAvatarMsg)}
        <ImageLoader
          onImageLoaded={image => {
            resetCrop()
            setImage(image)
          }}
          onError={error => console.log(error)}
        >
          <LinkButton>{intl.formatMessage(messages.changeImage)}</LinkButton>
        </ImageLoader>
      </Description>
      <Container>
        {uploading && (
          <LoadingImage>
            <Spinner id="loading-image" />
          </LoadingImage>
        )}
        {!uploading && (
          <Wrapper>
            <Cropper
              image={imageState ? imageState.data : imageProp.data}
              crop={crop}
              aspect={1}
              cropShape="round"
              showGrid={false}
              cropSize={cropSize}
              onCropSizeChange={newSize => setCropSize(newSize)}
              objectFit="vertical-cover"
              zoom={zoom}
              onZoomChange={newZoom => setZoom(newZoom)}
              onCropChange={newCrop => setCrop(newCrop)}
              onMediaLoaded={mediaSize => {
                setCropSize({
                  width: Math.min(mediaSize.width, mediaSize.height) / 2,
                  height: Math.min(mediaSize.width, mediaSize.height) / 2
                })
              }}
              onCropComplete={async (_, croppedArea) =>
                setCroppedArea(croppedArea)
              }
            />
          </Wrapper>
        )}
      </Container>
      {!uploading && (
        <Slider
          type="range"
          value={zoom}
          min={1}
          step={0.02}
          max={3}
          onChange={({ target: { value } }) => setZoom(+value)}
        />
      )}
    </ResponsiveModal>
  )
}

const mapStateToProps = (state: IStoreState) => {
  return {
    userDetails: getUserDetails(state)
  }
}

export const AvatarChangeModal = connect(mapStateToProps)(
  injectIntl(withOnlineStatus(AvatarChangeModalComp))
)
