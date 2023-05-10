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
import { Avatar } from '@client/components/Avatar'
import { buttonMessages, userMessages } from '@client/i18n/messages'
import { modifyUserDetails } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { IImage } from '@client/utils/imageUtils'
import { UserDetails, useUserName } from '@client/utils/userUtils'
import { AvatarChangeModal } from '@client/views/Settings/AvatarChangeModal'
import { ImageLoader } from '@client/views/Settings/ImageLoader'
import {
  DynamicHeightLinkButton,
  LabelContainer,
  TopAlignedListViewItemSimplified,
  ValueContainer
} from '@client/views/Settings/items/components'
import { Toast } from '@opencrvs/components/lib/Toast'
import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'

export function ProfileImage() {
  const intl = useIntl()
  const [showChangeAvatar, setShowChangeAvatar] = React.useState(false)
  const [imageUploading, setImageUploading] = React.useState(false)
  const [image, setImage] = React.useState<IImage>({
    type: '',
    data: ''
  })
  const [imageLoadingError, setImageLoadingError] = React.useState('')
  const toggleAvatarChangeModal = () => {
    setShowChangeAvatar((prevValue) => !prevValue)
  }
  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState(false)

  const toggleSuccessNotification = () => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }

  const handleConfirmAvatarChange = () => {
    setImageUploading(true)
    toggleAvatarChangeModal()
    toggleSuccessNotification()
  }

  const englishName = useUserName()

  const userDetails = useSelector<IStoreState, UserDetails | null>(
    getUserDetails
  )
  const dispatch = useDispatch()

  const changeAvatar = React.useCallback(
    (avatar: IImage) => {
      if (userDetails) {
        setImageUploading(false)
        dispatch(
          modifyUserDetails({
            ...userDetails,
            avatar
          })
        )
      }
    },
    [dispatch, userDetails]
  )

  const handleImageLoaded = (image: IImage) => {
    setImage(image)
  }

  return (
    <>
      <TopAlignedListViewItemSimplified
        label={
          <LabelContainer>
            {intl.formatMessage(userMessages.profileImage)}
          </LabelContainer>
        }
        value={
          <ValueContainer>
            <Avatar avatar={userDetails?.avatar} name={englishName} />
          </ValueContainer>
        }
        actions={
          <ImageLoader
            onImageLoaded={handleImageLoaded}
            onLoadingStarted={toggleAvatarChangeModal}
            onError={(imageLoadingError) =>
              setImageLoadingError(imageLoadingError)
            }
          >
            <DynamicHeightLinkButton>
              {intl.formatMessage(buttonMessages.change)}
            </DynamicHeightLinkButton>
          </ImageLoader>
        }
      />
      <AvatarChangeModal
        cancelAvatarChangeModal={toggleAvatarChangeModal}
        showChangeAvatar={showChangeAvatar}
        imgSrc={image}
        onImgSrcChanged={(image) => setImage(image)}
        error={imageLoadingError}
        onErrorChanged={(imageLoadingError) =>
          setImageLoadingError(imageLoadingError)
        }
        onConfirmAvatarChange={handleConfirmAvatarChange}
        onAvatarChanged={changeAvatar}
      />
      {showSuccessNotification && (
        <Toast
          type={imageUploading ? 'loading' : 'success'}
          onClose={
            imageUploading ? undefined : () => toggleSuccessNotification()
          }
        >
          <FormattedMessage
            {...(imageUploading
              ? userMessages.avatarUpdating
              : userMessages.avatarUpdated)}
          />
        </Toast>
      )}
    </>
  )
}
