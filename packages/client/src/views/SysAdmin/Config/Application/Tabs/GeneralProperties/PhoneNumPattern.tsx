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
import { useDispatch, useSelector } from 'react-redux'
import {
  ApplyButton,
  CancelButton,
  Label,
  Message,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { IStoreState } from '@client/store'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import {
  callApplicationConfigMutation,
  isValidRegEx,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { EMPTY_STRING } from '@client/utils/constants'
import ContentComponent from '@client/views/SysAdmin/Config/Application/Tabs/GeneralProperties/NIDPhoneNumContent'
import { Link } from '@opencrvs/components/lib/Link'

export function PhoneNumPattern() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [phoneNumberPattern, setPhoneNumberPattern] = React.useState(
    String(offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN)
  )
  const [phoneNumberExample, setPhoneNumberExample] =
    React.useState(EMPTY_STRING)
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setPhoneNumberPattern(
      String(offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN)
    )
    setPhoneNumberExample(EMPTY_STRING)
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  const handlePhoneNumberPattern = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pattern = event.target.value
    setPhoneNumberPattern(pattern)
  }

  const handlePhoneNumberExample = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const example = event.target.value
    setPhoneNumberExample(example)
  }

  async function phoneNumberPatternMutationHandler() {
    try {
      toggleModal()
      await callApplicationConfigMutation(
        GeneralActionId.PHONE_NUMBER_PATTERN,
        {
          ...offlineCountryConfiguration.config,
          PHONE_NUMBER_PATTERN: phoneNumberPattern as unknown as RegExp
        },
        dispatch,
        setNotificationStatus
      )
    } catch {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
    }
  }
  const id = GeneralActionId.PHONE_NUMBER_PATTERN
  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.phoneNumberLabel)}
          </Label>
        }
        value={
          <Value id={`${id}_value`} overflowWrap="anywhere">
            {String(offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN)}
          </Value>
        }
        actions={
          <Link id={id} onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.change)}
          </Link>
        }
      />

      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.phoneNumberPatternTitle)}
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
              !isValidRegEx(phoneNumberPattern) ||
              !Boolean(phoneNumberPattern) ||
              notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            }
            onClick={() => {
              phoneNumberPatternMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Message>
          {intl.formatMessage(messages.phoneNumberChangeMessage)}
        </Message>
        <ContentComponent
          intl={intl}
          changeModalName={GeneralActionId.PHONE_NUMBER_PATTERN}
          pattern={phoneNumberPattern}
          example={phoneNumberExample}
          setPattern={handlePhoneNumberPattern}
          setExample={handlePhoneNumberExample}
          patternErrorMessage={intl.formatMessage(
            messages.phoneNumberChangeError
          )}
        />
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
            ? intl.formatMessage(messages.phoneNumberChangeNotification)
            : intl.formatMessage(messages.applicationConfigChangeError)}
        </Toast>
      )}
    </>
  )
}
