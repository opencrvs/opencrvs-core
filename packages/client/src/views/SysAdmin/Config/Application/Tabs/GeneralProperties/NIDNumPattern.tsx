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
  isValidRegEx,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { EMPTY_STRING } from '@client/utils/constants'
import ContentComponent from '@client/views/SysAdmin/Config/Application/Tabs/GeneralProperties/NIDPhoneNumContent'

export function NIDNumPattern() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [nidPattern, setNidPattern] = React.useState(
    String(offlineCountryConfiguration.config.NID_NUMBER_PATTERN)
  )
  const [nidExample, setNidExample] = React.useState(EMPTY_STRING)
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setNidPattern(String(offlineCountryConfiguration.config.NID_NUMBER_PATTERN))
    setNidExample(EMPTY_STRING)
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  const handleNIDPattern = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pattern = event.target.value
    setNidPattern(pattern)
  }

  const handleNIDExample = (event: React.ChangeEvent<HTMLInputElement>) => {
    const example = event.target.value
    setNidExample(example)
  }

  async function nidNumberPatternMutationHandler() {
    try {
      toggleModal()
      await callApplicationConfigMutation(
        GeneralActionId.NID_NUMBER_PATTERN,
        {
          ...offlineCountryConfiguration.config,
          NID_NUMBER_PATTERN: nidPattern as unknown as RegExp
        },
        dispatch,
        setNotificationStatus
      )
    } catch {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
    }
  }
  const id = GeneralActionId.NID_NUMBER_PATTERN
  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.nidPatternTitle)}
          </Label>
        }
        value={
          <Value id={`${id}_value`}>
            {String(offlineCountryConfiguration.config.NID_NUMBER_PATTERN)}
          </Value>
        }
        actions={
          <LinkButton id={id} onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.change)}
          </LinkButton>
        }
      />

      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.nidPatternTitle)}
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
              !isValidRegEx(nidPattern) ||
              !Boolean(nidPattern) ||
              notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            }
            onClick={() => {
              nidNumberPatternMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Message>
          {intl.formatMessage(messages.nidPatternChangeMessage)}
        </Message>
        <ContentComponent
          intl={intl}
          changeModalName={GeneralActionId.NID_NUMBER_PATTERN}
          pattern={nidPattern}
          example={nidExample}
          setPattern={handleNIDPattern}
          setExample={handleNIDExample}
          patternErrorMessage={intl.formatMessage(
            messages.nidPatternChangeError
          )}
        />
      </ResponsiveModal>

      <FloatingNotification
        id="nidPatternNotification"
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
          ? intl.formatMessage(messages.nidPatternChangeNotification)
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
