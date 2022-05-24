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

const Message = styled.div`
  margin-bottom: 16px;
`
const Label = styled.label`
  margin-bottom: 8px;
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
  }

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

interface ILanguageOptions {
  [key: string]: string
}

class SettingsView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showLanguageSettings: false,
      showSuccessNotification: false,
      selectedLanguage: this.props.language,
      showPasswordChange: false,
      showChangeAvatar: false,
      image: {
        type: '',
        data: ''
      },
      imageLoadingError: '',
      imageUploading: false,
      showAvatarNotification: false,
      notificationSubject: null
    }
  }

  componentDidMount() {
    if (this.props.history && this.props.history.location.state) {
      let phonedNumberUpdated = false
      const historyState = this.props.history.location.state
      phonedNumberUpdated = historyState.phonedNumberUpdated
      if (phonedNumberUpdated) {
        this.changePhoneNumber()
        this.props.history.replace({
          pathname: SETTINGS,
          state: { phonedNumberUpdated: false }
        })
      }
    }
  }

  toggleLanguageSettingsModal = () => {
    this.setState((state) => ({
      showLanguageSettings: !state.showLanguageSettings
    }))
  }

  toggleSuccessNotification = (subject: NOTIFICATION_SUBJECT | null = null) => {
    this.setState((state) => ({
      showSuccessNotification: !state.showSuccessNotification,
      notificationSubject: subject
    }))
  }

  toggleAvatarChangeModal = () => {
    this.setState((state) => ({
      showChangeAvatar: !state.showChangeAvatar
    }))
  }

  cancelLanguageSettings = () => {
    this.setState((state) => ({
      selectedLanguage: this.props.language,
      showLanguageSettings: !state.showLanguageSettings
    }))
  }

  togglePasswordChangeModal = () => {
    this.setState((state) => ({
      showPasswordChange: !state.showPasswordChange
    }))
  }

  changeLanguage = () => {
    if (this.props.userDetails) {
      this.props.changeLanguage({ language: this.state.selectedLanguage })
      this.toggleLanguageSettingsModal()
      this.toggleSuccessNotification(NOTIFICATION_SUBJECT.LANGUAGE)
    }
  }

  changePassword = () => {
    this.togglePasswordChangeModal()
    this.toggleSuccessNotification(NOTIFICATION_SUBJECT.PASSWORD)
  }
  changePhoneNumber = () => {
    this.toggleSuccessNotification(NOTIFICATION_SUBJECT.PHONE)
  }

  handleConfirmAvatarChange = () => {
    this.setState({ imageUploading: true })
    this.toggleAvatarChangeModal()
    this.toggleSuccessNotification(NOTIFICATION_SUBJECT.AVATAR)
  }

  changeAvatar = (avatar: IImage) => {
    if (this.props.userDetails) {
      this.setState({ imageUploading: false })
      const { userDetails } = this.props
      this.props.modifyUserDetails({
        ...userDetails,
        avatar
      })
    }
  }

  handleImageLoaded = (image: IImage) => {
    this.setState({
      image
    })
  }

  render() {
    const { userDetails, intl, languages, goToPhoneSettingAction } = this.props
    const langChoice = [] as ILanguageOptions[]
    const availableLangs = getAvailableLanguages()
    availableLangs.forEach((lang: string) => {
      if (languages[lang]) {
        langChoice.push({
          value: lang,
          label: languages[lang].displayName
        })
      }
    })

    let englishName = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName | null) => {
          const name = storedName as GQLHumanName
          return name.use === getDefaultLanguage()
        }
      ) as GQLHumanName

      englishName = `${String(nameObj.firstNames)} ${String(
        nameObj.familyName
      )}`
    }

    const mobile = (userDetails && userDetails.mobile) || ''

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''
    const items = [
      {
        label: intl.formatMessage(messages.labelEnglishName),
        value: englishName,
        action: {
          label: intl.formatMessage(buttonMessages.change),
          disabled: true
        }
      },
      {
        label: intl.formatMessage(constantsMessages.labelPhone),
        value: mobile,
        action: {
          label: intl.formatMessage(buttonMessages.change),
          disabled: false,
          handler: goToPhoneSettingAction
        }
      },
      {
        label: intl.formatMessage(constantsMessages.labelRole),
        value: role,
        action: {
          label: intl.formatMessage(buttonMessages.change),
          disabled: true
        }
      },
      {
        label: intl.formatMessage(messages.systemLanguage),
        value: languages[this.props.language].displayName,
        action: {
          id: 'BtnChangeLanguage',
          label: intl.formatMessage(buttonMessages.change),
          handler: this.toggleLanguageSettingsModal
        }
      },
      {
        label: intl.formatMessage(constantsMessages.labelPassword),
        value: '********',
        action: {
          id: 'BtnChangePassword',
          label: intl.formatMessage(buttonMessages.change),
          handler: this.togglePasswordChangeModal
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
                    onImageLoaded={this.handleImageLoaded}
                    onLoadingStarted={this.toggleAvatarChangeModal}
                    onError={(imageLoadingError) =>
                      this.setState({ imageLoadingError })
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
        <ResponsiveModal
          id="ChangeLanguageModal"
          title={intl.formatMessage(messages.changeLanguageTitle)}
          show={this.state.showLanguageSettings}
          actions={[
            <TertiaryButton
              key="cancel"
              id="modal_cancel"
              onClick={this.cancelLanguageSettings}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </TertiaryButton>,
            <PrimaryButton
              key="apply"
              id="apply_change"
              onClick={this.changeLanguage}
            >
              {intl.formatMessage(buttonMessages.apply)}
            </PrimaryButton>
          ]}
          handleClose={this.cancelLanguageSettings}
          contentHeight={175}
          contentScrollableY={true}
        >
          <Message>
            {intl.formatMessage(messages.changeLanguageMessege)}
          </Message>
          <Label>{intl.formatMessage(constantsMessages.labelLanguage)}</Label>
          <Select
            id="SelectLanguage"
            onChange={(val: string) => {
              this.setState({
                selectedLanguage: val
              })
            }}
            value={this.state.selectedLanguage}
            options={langChoice}
            placeholder=""
          />
        </ResponsiveModal>
        <AvatarChangeModal
          cancelAvatarChangeModal={this.toggleAvatarChangeModal}
          showChangeAvatar={this.state.showChangeAvatar}
          imgSrc={this.state.image}
          onImgSrcChanged={(image) => this.setState({ image })}
          error={this.state.imageLoadingError}
          onErrorChanged={(imageLoadingError) =>
            this.setState({ imageLoadingError })
          }
          onConfirmAvatarChange={this.handleConfirmAvatarChange}
          onAvatarChanged={this.changeAvatar}
        />
        <PasswordChangeModal
          togglePasswordChangeModal={this.togglePasswordChangeModal}
          showPasswordChange={this.state.showPasswordChange}
          passwordChanged={this.changePassword}
        />
        <FloatingNotification
          type={
            this.state.imageUploading
              ? NOTIFICATION_TYPE.IN_PROGRESS
              : NOTIFICATION_TYPE.SUCCESS
          }
          show={this.state.showSuccessNotification}
          callback={
            this.state.imageUploading
              ? undefined
              : () => this.toggleSuccessNotification()
          }
        >
          {/* Success notification message for Language Change */}
          {this.state.notificationSubject === NOTIFICATION_SUBJECT.LANGUAGE && (
            <FormattedMessage
              {...messages.changeLanguageSuccessMessage}
              values={{
                language: languages[this.state.selectedLanguage].displayName
              }}
            />
          )}
          {/* Success notification message for Password Change */}
          {this.state.notificationSubject === NOTIFICATION_SUBJECT.PASSWORD && (
            <FormattedMessage {...messages.passwordUpdated} />
          )}

          {/* Success notification message for Phone Change */}
          {this.state.notificationSubject === NOTIFICATION_SUBJECT.PHONE && (
            <FormattedMessage {...messages.phoneNumberUpdated} />
          )}

          {/* Success notification message for Avatar Change */}
          {this.state.notificationSubject === NOTIFICATION_SUBJECT.AVATAR && (
            <FormattedMessage
              {...(this.state.imageUploading
                ? messages.avatarUpdating
                : messages.avatarUpdated)}
            />
          )}
        </FloatingNotification>
      </>
    )
  }
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
)(injectIntl(SettingsView))
