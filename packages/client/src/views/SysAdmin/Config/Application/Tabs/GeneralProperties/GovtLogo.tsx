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
import { useDispatch, useSelector } from 'react-redux'
import {
  ApplyButton,
  CancelButton,
  Content,
  ErrorContent,
  ErrorMessage,
  Field,
  Label,
  Message,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { IStoreState } from '@client/store'
import {
  FloatingNotification,
  ListViewItemSimplified,
  NOTIFICATION_TYPE,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import {
  callApplicationConfigMutation,
  isWithinFileLength,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { EMPTY_STRING } from '@client/utils/constants'
import { Alert } from '@opencrvs/components/lib/icons/Alert'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { IAttachmentValue } from '@client/forms'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { CountryLogo } from '@opencrvs/components/lib/icons'

export function GovtLogo() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [logoFileName, setLogoFileName] = React.useState(EMPTY_STRING)
  const [errorOccured, setErrorOccured] = React.useState(false)
  const [errorMessages, setErrorMessages] = React.useState(EMPTY_STRING)
  const [govtLogo, setGovtLogo] = React.useState(EMPTY_STRING)
  const [isFileUploading, setIsFileUploading] = React.useState(false)
  const [logoFile, setLogoFile] = React.useState<{
    name?: string
    type: string
    data: string
  }>({
    name: EMPTY_STRING,
    type: EMPTY_STRING,
    data: EMPTY_STRING
  })
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)
  const handleGovtLogo = (data: string) => {
    setGovtLogo(data)
  }
  const handleLogoFile = (data: IAttachmentValue) => {
    setLogoFile(data)
  }
  const handleLogoFileName = (attachment: IAttachmentValue) => {
    setLogoFileName(attachment.name ?? EMPTY_STRING)
  }
  const onUploadingStateChanged = (isUploading: boolean) => {
    setIsFileUploading(isUploading)
  }
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => setShowModal((prev) => !prev)

  async function govtLogoMutationHandler() {
    if (isWithinFileLength(govtLogo as string) === false) {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
      setErrorMessages(intl.formatMessage(messages.govtLogoFileLimitError))
      setGovtLogo(EMPTY_STRING)
      handleLogoFile({
        name: EMPTY_STRING,
        type: EMPTY_STRING,
        data: EMPTY_STRING
      })
    }
    try {
      toggleModal()
      await callApplicationConfigMutation(
        GeneralActionId.COUNTRY_LOGO,
        {
          ...offlineCountryConfiguration.config,
          COUNTRY_LOGO: {
            file: govtLogo,
            fileName: logoFileName
          }
        },
        dispatch,
        setNotificationStatus
      )
    } catch {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
      setErrorMessages(intl.formatMessage(messages.govtLogoChangeNotification))
    }
  }
  const id = GeneralActionId.COUNTRY_LOGO
  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.govermentLogoLabel)}
          </Label>
        }
        value={
          <CountryLogo
            src={offlineCountryConfiguration.config.COUNTRY_LOGO.file}
          />
        }
        actions={
          <LinkButton id={id} onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.change)}
          </LinkButton>
        }
      />
      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.govermentLogoLabel)}
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
              !Boolean(govtLogo) ||
              notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            }
            onClick={() => {
              govtLogoMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Message>{intl.formatMessage(messages.govtLogoChangeMessage)}</Message>
        {errorOccured && (
          <ErrorContent>
            <Alert color="invert" />
            <ErrorMessage>
              <div>{errorMessages}</div>
            </ErrorMessage>
          </ErrorContent>
        )}
        <Content>
          <Field id="govtLogoFile">
            <SimpleDocumentUploader
              label={logoFile.name ? logoFile.name : ''}
              disableDeleteInPreview={false}
              name={intl.formatMessage(messages.govermentLogoLabel)}
              allowedDocType={['image/png', 'image/svg']}
              onComplete={(file) => {
                setErrorOccured(false)
                setErrorMessages(EMPTY_STRING)
                handleGovtLogo((file as IAttachmentValue).data as string)
                handleLogoFile(file as IAttachmentValue)
                handleLogoFileName(file as IAttachmentValue)
              }}
              files={logoFile}
              onUploadingStateChanged={onUploadingStateChanged}
              error={errorMessages}
            />
          </Field>
        </Content>
      </ResponsiveModal>

      <FloatingNotification
        id="print-cert-notification"
        type={
          notificationStatus === NOTIFICATION_STATUS.SUCCESS
            ? NOTIFICATION_TYPE.SUCCESS
            : notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            ? NOTIFICATION_TYPE.IN_PROGRESS
            : NOTIFICATION_TYPE.ERROR
        }
        show={notificationStatus !== NOTIFICATION_STATUS.IDLE}
        callback={() => {
          setNotificationStatus(NOTIFICATION_STATUS.IDLE)
        }}
      >
        {notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
          ? intl.formatMessage(messages.applicationConfigUpdatingMessage)
          : notificationStatus === NOTIFICATION_STATUS.SUCCESS
          ? intl.formatMessage(messages.govtLogoChangeNotification)
          : errorMessages}
      </FloatingNotification>
    </>
  )
}
