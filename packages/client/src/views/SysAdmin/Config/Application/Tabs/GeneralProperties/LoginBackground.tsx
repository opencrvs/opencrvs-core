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

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { EMPTY_STRING } from '@client/utils/constants'
import {
  callApplicationConfigMutation,
  isValidHexColorCode,
  isValidHexColorCodeEntry,
  isWithinFileLength,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'

import {
  FormTabs,
  Link,
  ListViewItemSimplified,
  ResponsiveModal,
  Stack,
  Text,
  Toast
} from '@opencrvs/components/lib'
import {
  ApplyButton,
  CancelButton,
  ErrorContent,
  ErrorMessage,
  Field,
  HalfWidthInput,
  Label,
  Message
} from '@client/views/SysAdmin/Config/Application/Components'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { IAttachmentValue } from '@client/forms'

import { CountryLogo } from '@opencrvs/components/lib/icons'
import styled from 'styled-components'
import { InputField } from '@client/components/form/InputField'
import { Select2 } from '@opencrvs/components/lib/Select/Select2'

export enum TabId {
  COLOUR = 'Colour',
  IMAGE = 'Image'
}

enum BackgroundSize {
  FILL = 'FILL',
  TILE = 'TILE'
}

const Box = styled.span`
  width: 40px;
  height: 40px;
  margin-left: 5px;
  border: 2px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${(p) => (p.color ? p.color : '#fff')};
`

const HexInput = styled(HalfWidthInput)`
  width: 200px;
`

export const LoginBackground = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const [hexValue, setHexValue] = React.useState(EMPTY_STRING)
  const [isRequestValid, setRequestValid] = React.useState(false)
  const [showColour, setShowColour] = React.useState(false)
  const [errorOccurred, setErrorOccurred] = React.useState(false)
  const [errorMessages, setErrorMessages] = React.useState(EMPTY_STRING)
  const [backgroundImage, setBackgroundImage] = React.useState(EMPTY_STRING)
  const [showModal, setShowModal] = React.useState(false)
  const [activeTabId, setActiveTabId] = React.useState(TabId.COLOUR)
  const [backgroundFile, setBackgroundFile] = React.useState<{
    name?: string
    type: string
    data: string
  }>({
    name: EMPTY_STRING,
    type: EMPTY_STRING,
    data: EMPTY_STRING
  })
  const [backgroundType, setBackgroundType] = React.useState(
    BackgroundSize.FILL
  )
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)
  const tabSections = [
    {
      id: TabId.COLOUR,
      title: intl.formatMessage(messages.colourTabTitle)
    },
    {
      id: TabId.IMAGE,
      title: intl.formatMessage(messages.imageTabTitle)
    }
  ]

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase()

    if (isValidHexColorCodeEntry(value)) {
      setHexValue(value)
    }
    if (isValidHexColorCode(value)) {
      setShowColour(true)
      setRequestValid(true)
    } else {
      setShowColour(false)
      setRequestValid(false)
    }
  }

  const selectOptions = [
    { label: BackgroundSize.FILL, value: BackgroundSize.FILL },
    { label: BackgroundSize.TILE, value: BackgroundSize.TILE }
  ]

  const handleBackgroundImage = (data: string) => {
    setBackgroundImage(data)
    setRequestValid(true)
  }

  const clearInputs = () => {
    setBackgroundImage(EMPTY_STRING)
    setRequestValid(false)
    setHexValue(EMPTY_STRING)
    handleBackgroundImageFile({
      name: EMPTY_STRING,
      type: EMPTY_STRING,
      data: EMPTY_STRING
    })
  }

  const handleBackgroundImageFile = (data: IAttachmentValue) => {
    setBackgroundFile(data)
  }

  const handleBackgroundImageFileName = (attachment: IAttachmentValue) => {
    if (!attachment) setRequestValid(false)
  }

  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setErrorMessages(EMPTY_STRING)
  }

  async function backgroundMutationHandler() {
    if (!hexValue && !isWithinFileLength(backgroundImage)) {
      setErrorMessages(
        intl.formatMessage(messages.backgroundImageFileLimitError)
      )
      setBackgroundImage(EMPTY_STRING)
      setRequestValid(false)
      handleBackgroundImageFile({
        name: EMPTY_STRING,
        type: EMPTY_STRING,
        data: EMPTY_STRING
      })
    } else {
      try {
        toggleModal()
        await callApplicationConfigMutation(
          GeneralActionId.LOGIN_BACKGROUND,
          {
            ...offlineCountryConfiguration.config,
            LOGIN_BACKGROUND: {
              backgroundColor: hexValue,
              backgroundImage: backgroundImage,
              imageFit: backgroundType
            }
          },
          dispatch,
          setNotificationStatus
        )
      } catch {
        setNotificationStatus(NOTIFICATION_STATUS.ERROR)
        setErrorMessages(intl.formatMessage(messages.backgroundImageError))
      }
    }
  }

  const id = GeneralActionId.LOGIN_BACKGROUND

  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.loginBackgroundLabel)}
          </Label>
        }
        value={
          !offlineCountryConfiguration.config.LOGIN_BACKGROUND ? (
            <Box id="Box" color={'#FFF'}></Box>
          ) : (
            <>
              {offlineCountryConfiguration.config.LOGIN_BACKGROUND
                .backgroundImage ? (
                <>
                  <CountryLogo
                    src={
                      offlineCountryConfiguration.config.LOGIN_BACKGROUND
                        .backgroundImage
                    }
                  />
                </>
              ) : (
                <>
                  <Box
                    id="Box"
                    color={
                      '#' +
                      offlineCountryConfiguration.config.LOGIN_BACKGROUND
                        .backgroundColor
                    }
                  ></Box>
                </>
              )}
            </>
          )
        }
        actions={
          <Link id={id} onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.change)}
          </Link>
        }
      />
      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.loginBackgroundLabel)}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        actions={[
          <CancelButton key="cancel" id="modal_cancel" onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.cancel)}
          </CancelButton>,
          <ApplyButton
            key="apply"
            id="apply_change"
            disabled={
              !Boolean(isRequestValid) ||
              notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            }
            onClick={() => {
              backgroundMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        {errorOccurred && (
          <ErrorContent>
            <ErrorMessage>
              <div>{errorMessages}</div>
            </ErrorMessage>
          </ErrorContent>
        )}
        <FormTabs
          sections={tabSections}
          activeTabId={activeTabId}
          onTabClick={(id: TabId) => {
            setActiveTabId(id)
            clearInputs()
          }}
        />
        {activeTabId === TabId.COLOUR && (
          <Field id="colortab">
            <InputField
              id="applicationField"
              touched={false}
              required={false}
              label={intl.formatMessage(messages.colourTabText)}
            >
              <HexInput
                id="applicationHexColor"
                type="text"
                value={hexValue}
                maxLength={6}
                onChange={handleColorChange}
              />
              {showColour ? (
                <Box id="Box" color={'#' + hexValue}></Box>
              ) : (
                <Box id="Box"></Box>
              )}
              <Message></Message>
            </InputField>
          </Field>
        )}
        {activeTabId === TabId.IMAGE && (
          <>
            <Field id="backgroundImageFile">
              <Text variant="reg16" element="span">
                {intl.formatMessage(messages.loginImageText)}
              </Text>

              <SimpleDocumentUploader
                label={backgroundFile.name ? backgroundFile.name : ''}
                disableDeleteInPreview={false}
                name={intl.formatMessage(messages.loginBackgroundLabel)}
                allowedDocType={['image/png', 'image/jpeg']}
                onComplete={(file) => {
                  setErrorOccurred(false)
                  setErrorMessages(EMPTY_STRING)
                  handleBackgroundImage(
                    (file as IAttachmentValue).data as string
                  )
                  handleBackgroundImageFile(file as IAttachmentValue)
                  handleBackgroundImageFileName(file as IAttachmentValue)
                }}
                files={backgroundFile}
                touched
                error={errorMessages}
              />
            </Field>
            {backgroundImage && (
              <Stack
                alignItems="center"
                direction="row"
                gap={8}
                justifyContent="flex-start"
              >
                <Select2
                  value={backgroundType}
                  options={selectOptions}
                  onChange={({ value }) => {
                    setBackgroundType(value)
                  }}
                />
              </Stack>
            )}
          </>
        )}
      </ResponsiveModal>
      {notificationStatus !== NOTIFICATION_STATUS.IDLE && (
        <Toast
          id="print-cert-notification"
          type={
            notificationStatus === NOTIFICATION_STATUS.SUCCESS
              ? 'success'
              : notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
              ? 'loading'
              : 'warning'
          }
          onClose={() => {
            setNotificationStatus(NOTIFICATION_STATUS.IDLE)
          }}
        >
          {notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            ? intl.formatMessage(messages.applicationConfigUpdatingMessage)
            : notificationStatus === NOTIFICATION_STATUS.SUCCESS
            ? intl.formatMessage(messages.backgroundImageChangeNotification)
            : errorMessages}
        </Toast>
      )}
    </>
  )
}
