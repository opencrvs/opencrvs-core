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
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
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
} from '@client/views/Settings/items/components'
import { useSelector, useDispatch } from 'react-redux'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Select } from '@opencrvs/components/lib/Select'
import { getAvailableLanguages } from '@client/i18n/utils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { changeLanguage as changeLanguageActionCreator } from '@client/i18n/actions'
import { getLanguage, getLanguages } from '@client/i18n/selectors'

interface ILanguageOptions {
  [key: string]: string
}

export function Language() {
  const [showModal, setShowModal] = React.useState(false)
  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState(false)
  const intl = useIntl()
  const languages = useSelector(getLanguages)
  const language = useSelector(getLanguage)
  const [selectedLanguage, setSelectedLanguage] =
    React.useState<string>(language)
  const toggleLanguageModal = () => {
    setShowModal((prevValue) => !prevValue)
  }

  const cancelLanguageSettings = () => {
    setSelectedLanguage(language)
    toggleLanguageModal()
  }

  const toggleSuccessNotification = () => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }

  const userDetails = useSelector(getUserDetails)

  const dispatch = useDispatch()

  const changeLanguage = () => {
    if (userDetails) {
      dispatch(changeLanguageActionCreator({ language: selectedLanguage }))
      toggleLanguageModal()
      toggleSuccessNotification()
    }
  }

  const availableLangs = getAvailableLanguages()
  const langChoice = availableLangs.reduce<ILanguageOptions[]>(
    (choices, lang) =>
      languages[lang]
        ? [
            ...choices,
            {
              value: lang,
              label: intl.formatMessage(userMessages.language, {
                language: languages[lang].lang
              })
            }
          ]
        : choices,
    []
  )

  return (
    <>
      <ListViewItemSimplified
        label={
          <LabelContainer>
            {intl.formatMessage(userMessages.systemLanguage)}
          </LabelContainer>
        }
        value={
          <ValueContainer>
            {intl.formatMessage(userMessages.language, {
              language: languages[language].lang
            })}
          </ValueContainer>
        }
        actions={
          <DynamicHeightLinkButton
            id="BtnChangeLanguage"
            onClick={toggleLanguageModal}
          >
            {intl.formatMessage(buttonMessages.change)}
          </DynamicHeightLinkButton>
        }
      />
      <ResponsiveModal
        id="ChangeLanguageModal"
        title={intl.formatMessage(userMessages.changeLanguageTitle)}
        show={showModal}
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
      {showSuccessNotification && (
        <Toast type="success" onClose={toggleSuccessNotification}>
          <FormattedMessage {...userMessages.changeLanguageSuccessMessage} />
        </Toast>
      )}
    </>
  )
}
