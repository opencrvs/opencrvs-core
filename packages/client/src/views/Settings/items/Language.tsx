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
import {
  ListViewItemSimplified,
  ResponsiveModal,
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  userMessages,
  buttonMessages,
  constantsMessages
} from '@client/i18n/messages'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton,
  Message,
  Label
} from '@client/views/Settings/items/utils'
import { useSelector, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import { ILanguageState } from '@client/i18n/reducer'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Select } from '@opencrvs/components/lib/forms'
import { getAvailableLanguages } from '@client/i18n/utils'
import { IUserDetails } from '@client/utils/userUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { changeLanguage as changeLanguageActionCreator } from '@client/i18n/actions'

interface ILanguageOptions {
  [key: string]: string
}

export function Language() {
  const [showModal, setShowModal] = React.useState(false)
  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState<boolean>(false)
  const intl = useIntl()
  const languages = useSelector<IStoreState, ILanguageState>(
    (state) => state.i18n.languages
  )
  const language = useSelector<IStoreState, string>(
    (state) => state.i18n.language
  )
  const [selectedLanguage, setSelectedLanguage] =
    React.useState<string>(language)
  const toggleLanguageSettingsModal = React.useCallback(() => {
    setShowLanguageSettings((prevValue) => !prevValue)
  }, [])

  const cancelLanguageSettings = React.useCallback(() => {
    setSelectedLanguage(language)
    setShowLanguageSettings((prevValue) => !prevValue)
  }, [language])

  const toggleSuccessNotification = React.useCallback(() => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }, [])

  const userDetails = useSelector(getUserDetails)

  const dispatch = useDispatch()

  const changeLanguage = React.useCallback(() => {
    if (userDetails) {
      dispatch(changeLanguageActionCreator({ language: selectedLanguage }))
      toggleLanguageSettingsModal()
      toggleSuccessNotification()
    }
  }, [
    userDetails,
    dispatch,
    toggleLanguageSettingsModal,
    toggleSuccessNotification,
    selectedLanguage
  ])

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

  return (
    <>
      <ListViewItemSimplified
        label={
          <LabelContainer>
            {intl.formatMessage(userMessages.systemLanguage)}
          </LabelContainer>
        }
        value={
          <ValueContainer>{languages[language].displayName}</ValueContainer>
        }
        actions={
          <DynamicHeightLinkButton
            id="BtnChangeLanguage"
            onClick={toggleLanguageSettingsModal}
          >
            {intl.formatMessage(buttonMessages.change)}
          </DynamicHeightLinkButton>
        }
      />
      <ResponsiveModal
        id="ChangeLanguageModal"
        title={intl.formatMessage(userMessages.changeLanguageTitle)}
        show={showLanguageSettings}
        actions={[
          <TertiaryButton
            key="cancel"
            id="modal_cancel"
            onClick={cancelLanguageSettings}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </TertiaryButton>,
          <PrimaryButton key="apply" id="apply_change" onClick={changeLanguage}>
            {intl.formatMessage(buttonMessages.apply)}
          </PrimaryButton>
        ]}
        handleClose={cancelLanguageSettings}
        contentHeight={175}
        contentScrollableY={true}
      >
        <Message>
          {intl.formatMessage(userMessages.changeLanguageMessege)}
        </Message>
        <Label>{intl.formatMessage(constantsMessages.labelLanguage)}</Label>
        <Select
          id="SelectLanguage"
          onChange={(val: string) => {
            setSelectedLanguage(val)
          }}
          value={selectedLanguage}
          options={langChoice}
          placeholder=""
        />
      </ResponsiveModal>
      <FloatingNotification
        type={NOTIFICATION_TYPE.SUCCESS}
        show={showSuccessNotification}
        callback={toggleSuccessNotification}
      >
        <FormattedMessage
          {...userMessages.changeLanguageSuccessMessage}
          values={{
            language: languages[selectedLanguage].displayName
          }}
        />
      </FloatingNotification>
    </>
  )
}
