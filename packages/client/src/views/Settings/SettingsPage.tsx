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
import { connect } from 'react-redux'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  FormattedMessage
} from 'react-intl'
import { IStoreState } from '@client/store'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import styled from '@client/styledComponents'
import { Header } from '@client/components/interface/Header/Header'
import { Avatar } from '@client/components/Avatar'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import {
  ResponsiveModal,
  NOTIFICATION_TYPE,
  FloatingNotification
} from '@opencrvs/components/lib/interface'
import { Select } from '@opencrvs/components/lib/forms'
import {
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import {
  userMessages as messages,
  buttonMessages,
  constantsMessages
} from '@client/i18n/messages'
import { modifyUserDetails as modifyUserDetailsAction } from '@client/profile/profileActions'
import { changeLanguage as changeLanguageAction } from '@client/i18n/actions'
import { getDefaultLanguage, getAvailableLanguages } from '@client/i18n/utils'
import { IntlState } from '@client/i18n/reducer'
import { PasswordChangeModal } from '@client/views/Settings/PasswordChangeModal'
import { goToPhoneSettings } from '@client/navigation'
import { RouteComponentProps, StaticContext } from 'react-router'
import { SETTINGS } from '@client/navigation/routes'
import { Navigation } from '@client/components/interface/Navigation'
import { AvatarChangeModal } from './AvatarChangeModal'
import { IImage } from '@client/utils/imageUtils'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { ImageLoader } from './ImageLoader'
import {
  IOnlineStatusProps,
  withOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import { useEffect } from 'react'
import { Name, Role, Language } from '@client/views/Settings/items'

const BodyContainer = styled.div`
  margin-left: 0px;
  margin-top: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 274px;
    margin-top: 24px;
    margin-right: 24px;
  }
`

const LabelContainer = styled.span`
  ${({ theme }) => theme.fonts.bold16}
`

const ValueContainer = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`

type IProps = IntlShapeProps &
  RouteComponentProps<
    {},
    StaticContext,
    {
      phonedNumberUpdated: boolean
    }
  > & {
    language: string
    languages: IntlState['languages']
    userDetails: IUserDetails | null
    modifyUserDetails: typeof modifyUserDetailsAction
    changeLanguage: typeof changeLanguageAction
    goToPhoneSettingAction: typeof goToPhoneSettings
  } & IOnlineStatusProps

enum NOTIFICATION_SUBJECT {
  LANGUAGE,
  PASSWORD,
  AVATAR,
  PHONE
}

const TopAlignedListViewItemSimplified = styled(ListViewItemSimplified)`
  align-items: start;
  padding: 16px 0;
`
const DynamicHeightLinkButton = styled(LinkButton)`
  height: auto;
`

interface IState {
  showLanguageSettings: boolean
  selectedLanguage: string
  showSuccessNotification: boolean
  showPasswordChange: boolean
  showChangeAvatar: boolean
  notificationSubject: NOTIFICATION_SUBJECT | null
  image: IImage
  imageLoadingError: string
  imageUploading: boolean
  showAvatarNotification: boolean
}

function SettingsView(props: IProps) {
  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState<boolean>(false)
  const [showPasswordChange, setShowPasswordChange] =
    React.useState<boolean>(false)
  const [showChangeAvatar, setShowChangeAvatar] = React.useState<boolean>(false)
  const [imageUploading, setImageUploading] = React.useState<boolean>(false)
  const [showAvatarNotification, setShowAvatarNotification] =
    React.useState<boolean>(false)
  const [image, setImage] = React.useState<IImage>({
    type: '',
    data: ''
  })
  const [imageLoadingError, setImageLoadingError] = React.useState<string>('')
  const [notificationSubject, setNotificationSubject] =
    React.useState<NOTIFICATION_SUBJECT | null>(null)

  const changePhoneNumber = React.useCallback(() => {
    toggleSuccessNotification(NOTIFICATION_SUBJECT.PHONE)
  }, [])
  useEffect(() => {
    if (props.history && props.history.location.state) {
      let phonedNumberUpdated = false
      const historyState = props.history.location.state
      phonedNumberUpdated = historyState.phonedNumberUpdated
      if (phonedNumberUpdated) {
        changePhoneNumber()
        props.history.replace({
          pathname: SETTINGS,
          state: { phonedNumberUpdated: false }
        })
      }
    }
  }, [props.history, changePhoneNumber])

  const toggleSuccessNotification = (
    subject: NOTIFICATION_SUBJECT | null = null
  ) => {
    setShowSuccessNotification((prevValue) => !prevValue)
    setNotificationSubject(subject)
  }

  const toggleAvatarChangeModal = () => {
    setShowChangeAvatar((prevValue) => !prevValue)
  }

  const togglePasswordChangeModal = () => {
    setShowPasswordChange((prevValue) => !prevValue)
  }

  const changePassword = () => {
    togglePasswordChangeModal()
    toggleSuccessNotification(NOTIFICATION_SUBJECT.PASSWORD)
  }

  const handleConfirmAvatarChange = () => {
    setImageUploading(true)
    toggleAvatarChangeModal()
    toggleSuccessNotification(NOTIFICATION_SUBJECT.AVATAR)
  }

  const changeAvatar = (avatar: IImage) => {
    if (props.userDetails) {
      setImageUploading(false)
      const { userDetails } = props
      props.modifyUserDetails({
        ...userDetails,
        avatar
      })
    }
  }

  const handleImageLoaded = (image: IImage) => {
    setImage(image)
  }

  const { userDetails, intl, languages, goToPhoneSettingAction, isOnline } =
    props

  let englishName = ''
  if (userDetails && userDetails.name) {
    const nameObj = userDetails.name.find((storedName: GQLHumanName | null) => {
      const name = storedName as GQLHumanName
      return name.use === getDefaultLanguage()
    }) as GQLHumanName

    englishName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
  }

  const mobile = (userDetails && userDetails.mobile) || ''

  const role =
    userDetails && userDetails.role
      ? intl.formatMessage(messages[userDetails.role])
      : ''
  const items = [
    {
      label: intl.formatMessage(constantsMessages.labelPhone),
      value: mobile,
      action: {
        label: intl.formatMessage(buttonMessages.change),
        disabled: isOnline ? false : true,
        handler: goToPhoneSettingAction
      }
    },
    {
      label: intl.formatMessage(constantsMessages.labelPassword),
      value: '********',
      action: {
        id: 'BtnChangePassword',
        label: intl.formatMessage(buttonMessages.change),
        handler: togglePasswordChangeModal
      }
    },
    {
      label: intl.formatMessage(constantsMessages.labelPin),
      value: '****',
      action: {
        label: intl.formatMessage(buttonMessages.change),
        disabled: true
      }
    }
  ]

  return (
    <>
      <Header title={intl.formatMessage(messages.settingsTitle)} />
      <Navigation />
      <BodyContainer>
        <Content
          title={intl.formatMessage(messages.settingsTitle)}
          showTitleOnMobile={true}
        >
          <ListViewSimplified>
            <Name />
            {items.map((item) => {
              return (
                <ListViewItemSimplified
                  key={item.label}
                  label={<LabelContainer>{item.label}</LabelContainer>}
                  value={<ValueContainer>{item.value}</ValueContainer>}
                  actions={
                    <DynamicHeightLinkButton
                      id={item.action.id}
                      onClick={item.action.handler}
                      disabled={item.action.disabled}
                    >
                      {item.action.label}
                    </DynamicHeightLinkButton>
                  }
                />
              )
            })}
            <Language />
            <Role />
            {/* For Profile Image */}
            <TopAlignedListViewItemSimplified
              label={
                <LabelContainer>
                  {intl.formatMessage(messages.profileImage)}
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
          </ListViewSimplified>
        </Content>
      </BodyContainer>
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
      <PasswordChangeModal
        togglePasswordChangeModal={togglePasswordChangeModal}
        showPasswordChange={showPasswordChange}
        passwordChanged={changePassword}
      />
      <FloatingNotification
        type={
          imageUploading
            ? NOTIFICATION_TYPE.IN_PROGRESS
            : NOTIFICATION_TYPE.SUCCESS
        }
        show={showSuccessNotification}
        callback={
          imageUploading ? undefined : () => toggleSuccessNotification()
        }
      >
        {/* Success notification message for Password Change */}
        {notificationSubject === NOTIFICATION_SUBJECT.PASSWORD && (
          <FormattedMessage {...messages.passwordUpdated} />
        )}

        {/* Success notification message for Phone Change */}
        {notificationSubject === NOTIFICATION_SUBJECT.PHONE && (
          <FormattedMessage {...messages.phoneNumberUpdated} />
        )}

        {/* Success notification message for Avatar Change */}
        {notificationSubject === NOTIFICATION_SUBJECT.AVATAR && (
          <FormattedMessage
            {...(imageUploading
              ? messages.avatarUpdating
              : messages.avatarUpdated)}
          />
        )}
      </FloatingNotification>
    </>
  )
}

export const SettingsPage = connect(
  (store: IStoreState) => ({
    language: store.i18n.language || getDefaultLanguage(),
    languages: store.i18n.languages,
    userDetails: getUserDetails(store)
  }),
  {
    modifyUserDetails: modifyUserDetailsAction,
    changeLanguage: changeLanguageAction,
    goToPhoneSettingAction: goToPhoneSettings
  }
)(injectIntl(withOnlineStatus(SettingsView)))
